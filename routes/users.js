'use strict';
const express = require('express');
const router = express.Router();

const UserModel = require('../models/User');
const ExpeditionModel = require('../models/Expedition');
const CharacterModel = require('../models/Character');
const ApiUtils = require('../scripts/ApiUtils');
const ArrayUtils = require('../scripts/ArrayUtils');

let ObjectId = require('mongodb').ObjectId;

const TokenValidator = require('../scripts/TokenValidator');

/*
    Metoda wzraca hashmape (userId -> username) użytkowników, którzy są w danej chwili wolni tj.
    - konto jest aktywne (flaga 'activeFlag')
    - nie biorą udziału w wyprawie
    - ich postac ma zdrowie wieksze od 0
    - ich postac ma poziom +/- 25% od agresora
    - zwraca tylko 10 losowych postaci
 */
router.get('/available', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let timestamp = new Date().getTime();

    CharacterModel
        .findOne({userId: ObjectId(userId)})
        .then(character => {
            if (character == null) {
                sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                return;
            }

            let characterLevel = character.level;
            let minLevel = Math.floor(characterLevel - (characterLevel * 0.25));
            let maxLevel = Math.ceil(characterLevel + (characterLevel * 0.25));

            CharacterModel
                .find()
                .then(characters => {
                    UserModel
                        .find()
                        .then(users => {
                            let filterUsers = users
                                .filter(user => user.activeFlag === true); //jako where nie chce dzialac dla kont zalozonych przed flagami
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

                                    let usersToFight = {};

                                    let shuffledCharacters = ArrayUtils.shuffle(characters);

                                    for (let i = 0; i < shuffledCharacters.length; i++) {
                                        let ch = shuffledCharacters[i];

                                        if (freeUsers.hasOwnProperty(ch.userId)) {
                                            if (userId.toString() !== ch.userId.toString()) {
                                                if (ch.level >= minLevel && ch.level <= maxLevel) {
                                                    if (ch.currentHealth > 0) {
                                                        if (Object.keys(usersToFight).length < 10) {
                                                            usersToFight[ch.userId] = freeUsers[ch.userId];
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    res.send(usersToFight)
                                })
                                .catch(reason => {
                                    sendApiError(res, 500, "Couldn't download expeditions list: " + reason.message);
                                });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download users list: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download characters list: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        });
});

function sendApiError(res, code, message) {
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

module.exports = router;