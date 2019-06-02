'use strict';
const express = require('express');
const router = express.Router();

let ObjectId = require('mongodb').ObjectId;

const CharacterModel = require('../models/Character');
const ClanModel = require('../models/Clan');
const ClanCommanderModel = require('../models/ClanCommander');
const ApiUtils = require('../scripts/ApiUtils');

const TokenValidator = require('../scripts/TokenValidator');

/*
    Zwraca listę klanów wg. rankingu.
    Ranking wyliczany jako suma poziomów budynków.
 */
router.get('/', TokenValidator, function (req, res, next) {
    ClanModel
        .find()
        .then(clans => {
            res.send(
                clans
                    .sort(function (c1, c2) {
                        return c1.name.localeCompare(c2.name)
                    })
                    .sort(function (c1, c2) {
                        return c2.rank - c1.rank
                    })
            )
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download clans list: " + reason.message);
        });
});

/*
    Tworzy klan. Nalezy podac unikalne clanName. Uzytkownik nie moze nalezec do zadnego klanu kiedy chce utworzyc nowy klan.
 */
router.post('/create', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let clanName = req.body.clanName;

    if (clanName === undefined) {
        sendApiError(res, 500, "Field `clanName` can not be empty");
        return;
    }

    CharacterModel
        .findOne(
            {userId: ObjectId(userId)}
        )
        .then(character => {
            if (character === undefined) {
                sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                return;
            }

            if (character.clanId !== undefined) {
                sendApiError(res, 500, "Couldn't create a new clan when you belong to another clan");
                return;
            }

            ClanModel
                .find({name: clanName})
                .then(clans => {
                    if (clans.length > 0) {
                        sendApiError(res, 500, "Clan with name: " + clanName + " already exist");
                        return;
                    }

                    ClanModel
                        .create({
                            name: clanName
                        })
                        .then(clan => {
                            let clanId = clan._id;

                            let query = {
                                userId: ObjectId(userId)
                            };

                            CharacterModel
                                .update(
                                    query,
                                    {clanId: clanId},
                                    function (err, data) {
                                        if (err) {
                                            sendApiError(res, 500, "Couldn't attach user to a new clan: " + err.message);
                                            return;
                                        }

                                        if (data.nModified !== 1) {
                                            sendApiError(res, 500, "Attaching user error");
                                            return;
                                        }

                                        ClanCommanderModel
                                            .create({
                                                clanId: clanId,
                                                userId: userId
                                            })
                                            .then(() => {
                                                res.send(clan)
                                            })
                                            .catch(reason => {
                                                sendApiError(res, 500, "Couldn't attach user to a new clan commander: " + reason.message);
                                            });
                                    }
                                )
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't create a new clan: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download clans list: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        })
});

function sendApiError(res, code, message) {
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

module.exports = router;