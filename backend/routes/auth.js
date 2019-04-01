'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserModel = require('../models/User');
const ApiUtils = require('../scripts/ApiUtils');
const EmailUtils = require('../scripts/EmailUtils');
const config = require('../config');

const router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/register', function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let passwordConfirmation = req.body.passwordConfirmation;

    if (username === undefined) {
        sendApiError(res, "`Username` nie może być puste!");
        return;
    }

    if (username.length < config.minUsernameChars) {
        sendApiError(res, "`Username` musi mieć przynajmniej " + config.minUsernameChars + " znaki!");
        return;
    }

    if (email === undefined) {
        sendApiError(res, "`Email` nie moze byc puste!");
        return;
    }

    if (!EmailUtils.validate(email)) {
        sendApiError(res, "`Email` nie spelnia wymogow!");
        return;
    }

    if (password === undefined) {
        sendApiError(res, "`Haslo` nie moze byc puste!");
        return;
    }

    if (password.length < config.minPasswordChars) {
        sendApiError(res, "`Haslo` musi miec przynajmniej " + config.minPasswordChars + " znakow!");
        return;
    }

    if (passwordConfirmation === undefined) {
        sendApiError(res, "`Potworz haslo` nie moze byc puste!");
        return;
    }

    if (passwordConfirmation !== password) {
        sendApiError(res, "Hasła nie zgadzają się!");
        return;
    }

    let hashedPassword = bcrypt.hashSync(password, 8);

    UserModel.create(
        {
            username: username,
            email: email,
            password: hashedPassword
        },
        function (err, user) {
            if (err) {
                sendApiError(res, "Wystapil problem przy tworzeniu uzytkownika: " + err.message);
                return;
            }

            let token = jwt.sign({id: user._id}, config.jwtSecret, {expiresIn: config.jwtTime});

            res
                .status(200)
                .send(
                    {
                        result: "ok",
                        token: token
                    }
                );
        });
});

// router.get('/me', function (req, res) {
//     var token = req.headers['x-access-token'];
//
//     if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});
//
//     jwt.verify(token, config.jwtSecret, function (err, decoded) {
//         if (err) {
//             return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
//
//         }
//
//         // console.log(decoded.exp);
//
//         UserModel.findById(decoded.id,
//             {password: 0}, // projection
//             function (err, user) {
//                 if (err) return res.status(500).send("There was a problem finding the user.");
//                 if (!user) return res.status(404).send("No user found.");
//                 res.status(200).send(user);
//             });
//     });
// });

function sendApiError(res, message) {
    res
        .status(500)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

module.exports = router;