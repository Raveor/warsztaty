'use strict';
const express = require('express');
const router = express.Router();

const AdminTokenValidator = require('../scripts/AdminTokenValidator');
const ApiUtils = require('../scripts/ApiUtils');

const UserModel = require('../models/User');

let ObjectId = require('mongodb').ObjectId;

/**
 * Pobiera listę wszystkich użytkowników
 */
router.get('/users', AdminTokenValidator, function (req, res) {
    UserModel.find(function (err, users) {
        if (err) {
            sendApiError(res, 500, "Wystąpił błąd: " + err.message);
            return;
        }

        res
            .status(200)
            .send(JSON.stringify(users))
            .end();
    });
});

/**
 *  Wyłącza lub włącza uprawnienia administracyjne dla użytkownika
 *  Należy przesłać '_id' oraz flagę 'setAdmin' z wartością true lub false
 */
router.put('/users/admin', AdminTokenValidator, function (req, res) {
    let accountId = req.body._id;
    let setAdmin = req.body.setAdmin;

    if (accountId === undefined) {
        sendApiError(res, 500, "Pole '_id' nie moze byc puste");
        return;
    }

    if (setAdmin === undefined) {
        sendApiError(res, 500, "Pole 'setAdmin' nie moze byc puste");
        return;
    }

    UserModel.find({_id: ObjectId(accountId)}, function (err, user) {
        if (err) {
            sendApiError(res, 500, "Wystąpił błąd: " + err.message);
            return;
        }

        if (user.length !== 1) {
            sendApiError(res, 500, "Nie znaleziono użytkownika o podanym numerze id: " + accountId);
            return;
        }

        let oldAdminStatus = user[0].adminFlag;

        if (oldAdminStatus === false && setAdmin === false) {
            sendApiError(res, 500, "Nie mozesz odebrac uprawnien administracyjnych uzytkownikowi ktory ich nie posiada");
            return;
        }

        if (oldAdminStatus === true && setAdmin === true) {
            sendApiError(res, 500, "Nie mozesz nadac uprawnien administracyjnych uzytkownikowi ktory je juz posiada");
            return;
        }

        let query = {
            _id: accountId,
        };

        UserModel.update(
            query,
            {adminFlag: setAdmin},
            function (err, data) {
                if (err) {
                    sendApiError(res, 500, "Wystapil problem przy zmienie uprawnien administacyjnych: " + err.message);
                    return;
                }

                if (data.nModified !== 1) {
                    sendApiError(res, 500, "Wystapil problem przy zmienie uprawnien administacyjnych.");
                    return;
                }

                sendOkResult(res);
            }
        )
        ;
    });
});

/**
 *  Aktywuje lub deazktywuje konto uzytkownika
 *  Należy przesłać '_id' oraz flagę 'setActive' z wartością true lub false
 */
router.put('/users/active', AdminTokenValidator, function (req, res) {
    let accountId = req.body._id;
    let setActive = req.body.setActive;

    if (accountId === undefined) {
        sendApiError(res, 500, "Pole '_id' nie moze byc puste");
        return;
    }

    if (setActive === undefined) {
        sendApiError(res, 500, "Pole 'setActive' nie moze byc puste");
        return;
    }

    UserModel.find({_id: ObjectId(accountId)}, function (err, user) {
        if (err) {
            sendApiError(res, 500, "Wystąpił błąd: " + err.message);
            return;
        }

        if (user.length !== 1) {
            sendApiError(res, 500, "Nie znaleziono użytkownika o podanym numerze id: " + accountId);
            return;
        }

        let oldActiveStatus = user[0].activeFlag;

        if (oldActiveStatus === false && setActive === false) {
            sendApiError(res, 500, "Nie mozesz zdezaktywowac konta ktore jest niektywne.");
            return;
        }

        if (oldActiveStatus === true && setActive === true) {
            sendApiError(res, 500, "Nie mozesz aktywowac konta ktore jest juz aktywne.");
            return;
        }

        let query = {
            _id: accountId,
        };

        UserModel.update(
            query,
            {activeFlag: setActive},
            function (err, data) {
                if (err) {
                    sendApiError(res, 500, "Wystapil problem przy zmienie stanu konta: " + err.message);
                    return;
                }

                if (data.nModified !== 1) {
                    sendApiError(res, 500, "Wystapil problem przy zmienie stanu konta.");
                    return;
                }

                sendOkResult(res);
            }
        );
    });
});

/**
 *  Wylacza lub wlacza mozliwosc kontaktowania sie przez uzytkownika
 *  Należy przesłać '_id' oraz flagę 'setContact' z wartością true lub false
 */
router.put('/users/contact', AdminTokenValidator, function (req, res) {
    let accountId = req.body._id;
    let setContact = req.body.setContact;

    if (accountId === undefined) {
        sendApiError(res, 500, "Pole '_id' nie moze byc puste");
        return;
    }

    if (setContact === undefined) {
        sendApiError(res, 500, "Pole 'setContact' nie moze byc puste");
        return;
    }

    UserModel.find({_id: ObjectId(accountId)}, function (err, user) {
        if (err) {
            sendApiError(res, 500, "Wystąpił błąd: " + err.message);
            return;
        }

        if (user.length !== 1) {
            sendApiError(res, 500, "Nie znaleziono użytkownika o podanym numerze id: " + accountId);
            return;
        }

        let oldContactStatus = user[0].contactFlag;

        if (oldContactStatus === false && setContact === false) {
            sendApiError(res, 500, "Nie mozesz zablokowac opcji kontaktu uzytkownikowi ktorych ich nie ma.");
            return;
        }

        if (oldContactStatus === true && setContact === true) {
            sendApiError(res, 500, "Nie mozesz odblokowac opcji kontaktu uzytkownikowi ktory nie ma ich zablokowanych.");
            return;
        }

        let query = {
            _id: accountId,
        };

        UserModel.update(
            query,
            {contactFlag: setContact},
            function (err, data) {
                if (err) {
                    sendApiError(res, 500, "Wystapil problem przy zmianie opcji kontaktu: " + err.message);
                    return;
                }

                if (data.nModified !== 1) {
                    sendApiError(res, 500, "Wystapil problem przy zmianie opcji kontaktu:.");
                    return;
                }

                sendOkResult(res);
            }
        );
    });
});

/**
 *  Kasuje konto uzytkownika
 *  Należy przesłać '_id'
 */
router.delete('/users/delete', AdminTokenValidator, function (req, res) {
    let accountId = req.body._id;

    if (accountId === undefined) {
        sendApiError(res, 500, "Pole '_id' nie moze byc puste");
        return;
    }

    UserModel
        .remove(
            {_id: accountId}
            , function (err) {
                if (err) {
                    sendApiError(res, 500, "Wystapil blad przy usuwaniu konta uzytkownika");
                    return;
                }

                sendOkResult(res)
            });
});

function sendOkResult(res) {
    res
        .status(200)
        .send(JSON.stringify(ApiUtils.getApiOkResult()))
        .end();
}

function sendApiError(res, code, message) {
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

module.exports = router;