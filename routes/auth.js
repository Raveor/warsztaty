'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require ("nodemailer");

const UserModel = require('../models/User');
const CharacterModel = require('../models/Character');
const ApiUtils = require('../scripts/ApiUtils');
const EmailUtils = require('../scripts/EmailUtils');
const CharacterUtils = require('../scripts/CharacterUtils');

const config = require('../config');

const TokenValidator = require('../scripts/TokenValidator');
const NewPasswordTokenValidator = require('../scripts/NewPasswordTokenValidator');


const router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/register', function (req, res) {
    let username = req.body.username;
    let email = req.body.email;

    if (username === undefined) {
        sendApiError(res, 500, "`Username` nie może być puste!");
        return;
    }

    if (username.length < config.minUsernameChars) {
        sendApiError(res, 500, "`Username` musi mieć przynajmniej " + config.minUsernameChars + " znaki!");
        return;
    }

    if (email === undefined) {
        sendApiError(res, 500, "`Email` nie moze byc puste!");
        return;
    }

    if (!EmailUtils.validate(email)) {
        sendApiError(res, 500, "`Email` nie spelnia wymogow!");
        return;
    }

    let hashedPassword = processNewPassword(req,res);

    if(!hashedPassword){
        return;
    }

    UserModel.create(
        {
            username: username,
            email: email,
            password: hashedPassword
        },
        function (err, user) {
            if (err) {
                sendApiError(res, 500, "Wystapil problem przy tworzeniu uzytkownika: " + err.message);
                return;
            }

            let character = CharacterUtils.createNewCharacter(user._id);

            CharacterModel
                .create(character)
                .then(dep => {
                    CharacterModel.find({ userId: user._id }, function (err, e) {
                        if (err) {
                            sendApiError(res, 500, "Wystapil blad przy pobieraniu postaci: " + err.message);
                            return;
                        }
                    });
                })
                .catch(err => {
                    sendApiError(res, 500, "Wystapil problem przy tworzeniu postaci: " + err.message);
                });

            let token = jwt.sign({id: user._id}, config.jwtSecret, {expiresIn: config.jwtTime});

            sendApiToken(res, token);
        });
        
});

router.post('/google', function (req, res) {
    let googleToken = req.body.idtoken;

    verify(res, googleToken).catch(reason => {
        sendApiError(res, 500, "Blad weryfikacji tokenu Google: " + reason.message)
    });
});

router.post('/add/google', TokenValidator, function (req, res) {
    let userId = req.userId;

    console.log("merge google");

    let googleToken = req.body.idtoken;

    verifyMerge(res, userId, googleToken).catch(reason => {
        sendApiError(res, 500, "Blad weryfikacji tokenu Google: " + reason.message)
    });
});

router.post('/add/native', TokenValidator, function (req, res) {
    let userId = req.userId;

    let hashedPassword = processNewPassword(req,res);

    if(!hashedPassword){
        return;
    }

    let query = {
        _id: userId,
        password: {$exists: false}
    };

    UserModel.update(
        query,
        {password: hashedPassword},
        function (err, data) {
            if (err) {
                sendApiError(res, 500, "Wystapil problem przy ustawianiu hasla dla konta facebookowego: " + err.message);
                return;
            }

            if (data.nModified !== 1) {
                sendApiError(res, 500, "Wystapil problem przy ustawianiu hasla dla konta facebookowego.");
                return;
            }

            sendOkResult(res);
        });
});

router.post("/resetPassword", async function(req,res){
    console.log("got here");
    let userEmail = req.body.email;
    console.log(JSON.stringify(req.body,null,4));

    UserModel.findOne(
        {email: userEmail},
        function (err, user) {
            if (err) {
                sendApiError(res, 500, "Wystąpił błąd: " + err.message);
                return;
            }

            if (!user) {
                sendApiError(res, 404, "Nie odnaleziono uzytkownika z takim adresem e-mail!");
                return;
            }

            let transport = nodemailer.createTransport({
                service: 'SendGrid', // using Gmail didn't work out, so we're using a trial SendGrid account
                secure: false,
                auth: {
                    user: config.SendGridUsername,
                    pass: config.SendGridPass
                }
            });
            
            const resetToken = jwt.sign({
                id: user._id,
                isAdmin: user.adminFlag,
                canSetNewPassword: true
            }, config.jwtSecret, {expiresIn: config.jwtTime});

            const resetLink = `${config.clientHost}/setNewPassword?token=${resetToken}`;

            const mailOptions = {
                from: config.fromAddress,//mailConfig.username,
                to: userEmail,
                subject: 'MERN password reset',
                text: `Hello ${userEmail}, here's your password reset link: ${resetLink}. The link expires in ${config.jwtTime/3600} hours.`,
                html: `<p>Hello ${userEmail},</p>
                <p> here's your password reset link: <a href="${resetLink}">${resetLink}</a>.</p>
                <p>The link expires in ${config.jwtTime/3600} hours.</p>`
            };

            transport.sendMail(mailOptions, function (err, result) {
                if(err){
                    console.log(err)
                    sendApiError(res, 500, err);
                }
                else{
                    console.log(result);
                    sendOkResult(res);
                }
             });
        });

})

router.post("/setNewPassword", NewPasswordTokenValidator, function (req, res){
    let userId = req.userId;

    let hashedPassword = processNewPassword(req,res);

    if(!hashedPassword){
        return;
    }

    let query = {
        _id: userId
    };

    UserModel.update(
        query,
        {password: hashedPassword},
        function (err, data) {
            if (err) {
                sendApiError(res, 500, "Wystapil problem przy ustawianiu nowego hasla: " + err.message);
                return;
            }

            if (data.nModified !== 1) {
                sendApiError(res, 500, "Wystapil problem przy ustawianiu nowego hasla.");
                return;
            }

            sendOkResult(res);
        });

})

function processNewPassword(req, res){

    let password = req.body.password;
    let passwordConfirmation = req.body.passwordConfirmation;

    if (password === undefined) {
        sendApiError(res, 400, "`Haslo` nie moze byc puste!");
        return "";
    }

    if (password.length < config.minPasswordChars) {
        sendApiError(res, 400, "`Haslo` musi miec przynajmniej " + config.minPasswordChars + " znakow!");
        return "";
    }

    if (passwordConfirmation === undefined) {
        sendApiError(res, 400, "`Potworz haslo` nie moze byc puste!");
        return "";
    }

    if (passwordConfirmation !== password) {
        sendApiError(res, 400, "Hasła nie zgadzają się!");
        return "";
    }

    return bcrypt.hashSync(password, 8);
}

router.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    if (email === undefined) {
        sendApiError(res, 500, "`Email` nie moze byc puste!");
        return;
    }

    if (!EmailUtils.validate(email)) {
        sendApiError(res, 500, "`Email` nie spelnia wymogow!");
        return;
    }

    if (password === undefined) {
        sendApiError(res, 500, "`Haslo` nie moze byc puste!");
        return;
    }

    if (password.length < config.minPasswordChars) {
        sendApiError(res, 500, "`Haslo` musi miec przynajmniej " + config.minPasswordChars + " znakow!");
        return;
    }

    UserModel.findOne(
        {email: email},
        function (err, user) {
            if (err) {
                sendApiError(res, 500, "Wystąpił błąd: " + err.message);
                return;
            }

            if (!user) {
                sendApiError(res, 404, "Nie odnaleziono takiego uzytkownika!");
                return;
            }

            let isPasswordValid = bcrypt.compareSync(password, user.password);

            if (!isPasswordValid) {
                sendApiError(res, 401, "Haslo nie zgadza sie!");
                return;
            }

            if (user.activeFlag === false) {
                sendApiError(res, 500, "Konto zostalo zdezaktywowane");
                return;
            }

            let token = jwt.sign({
                id: user._id,
                isAdmin: user.adminFlag
            }, config.jwtSecret, {expiresIn: config.jwtTime});

            sendApiToken(res, token);
        });
});

async function verify(res, googleToken) {
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client(config.clientId);

    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: config.clientId,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const name = payload['given_name'];
    const surname = payload['family_name'];
    const email = payload['email'];

    UserModel.find({googleId: userid}, function (err, data) {
        if (err) {
            sendApiError(res, 500, "Wystapil problem przy wyszukiwaniu tokenu Google: " + err.message);
            return;
        }

        if (data.length === 0) {
            UserModel.create(
                {
                    username: name + surname,
                    email: email,
                    googleId: userid
                },
                function (err, user) {
                    if (err) {
                        sendApiError(res, 500, "Wystapil problem przy tworzeniu uzytkownika: " + err.message);
                        return;
                    }

                    let token = jwt.sign({id: user._id}, config.jwtSecret, {expiresIn: config.jwtTime});

                    sendApiToken(res, token);
                });
        } else {
            if (user.activeFlag === false) {
                sendApiError(res, 500, "Konto zostalo zdezaktywowane");
                return;
            }

            let token = jwt.sign({id: data[0]._id}, config.jwtSecret, {expiresIn: config.jwtTime});

            sendApiToken(res, token);
        }
    });
}

async function verifyMerge(res, userId, googleToken) {
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client(config.clientId);

    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: config.clientId,
    });
    const payload = ticket.getPayload();
    const googleId = payload['sub'];

    let query = {
        _id: userId,
        googleId: {$exists: false}
    };

    UserModel.update(
        query,
        {googleId: googleId},
        function (err, data) {
            if (err) {
                sendApiError(res, 500, "Wystapil problem przy dodawaniu konta facebookowego do natywnego: " + err.message);
                return;
            }

            if (data.nModified !== 1) {
                sendApiError(res, 500, "Wystapil problem przy dodawaniu konta facebookowego do natywnego.");
                return;
            }

            sendOkResult(res);
        });
}

function sendApiError(res, code, message) {
    // console.log(message);
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

function sendApiToken(res, token) {
    // console.log(token);
    res
        .status(200)
        .send(JSON.stringify(ApiUtils.getApiToken(token)))
        .end();
}

function sendOkResult(res) {
    res
        .status(200)
        .send(JSON.stringify(ApiUtils.getApiOkResult()))
        .end();
}

module.exports = router;