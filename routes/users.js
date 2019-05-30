'use strict';
const express = require('express');
const router = express.Router();

const UserModel = require('../models/User');
const ExpeditionModel = require('../models/Expedition');
const ApiUtils = require('../scripts/ApiUtils');

const TokenValidator = require('../scripts/TokenValidator');

/*
    Metoda wzraca hashmape (userId -> username) użytkowników, którzy są w danej chwili wolni tj.
    - konto jest aktywne (flaga 'activeFlag')
    - nie biorą udziału w wyprawie
 */
router.get('/available', TokenValidator, function (req, res, next) {
    let timestamp = new Date().getTime();

    UserModel
        .find()
        .then(users => {
            let filterUsers = users.filter(user => user.activeFlag === true); //jako where nie chce dzialac dla kont zalozonych przed flagami
            let freeUsers = {};

            for (let i = 0; i < filterUsers.length; i++) {
                let user = filterUsers[i];
                freeUsers[user.id] = user.username
            }

            ExpeditionModel
                .find()
                .then(expeditions => {
                    for (let j = 0; j < expeditions.length; j++) {
                        let expedition = expeditions[j];

                        if (expedition.whenStarted !== undefined) {
                            if ((expedition.whenStarted.getTime() + expedition.time) > timestamp) {
                                delete freeUsers[expedition.userId]
                            }
                        }
                    }

                    res.send(freeUsers)
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download expeditions list: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download users list: " + reason.message);
        });
});

function sendApiError(res, code, message) {
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

module.exports = router;