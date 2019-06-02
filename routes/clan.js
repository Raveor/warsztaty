'use strict';
const express = require('express');
const router = express.Router();

let ObjectId = require('mongodb').ObjectId;

const CharacterModel = require('../models/Character');
const UserModel = require('../models/User');
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
    Zwraca liste czlonkow klanu (mapa userId -> username). Nalezy podac clanName
 */
router.get('/members', TokenValidator, function (req, res, next) {
    let clanName = req.body.clanName;

    if (clanName === undefined) {
        sendApiError(res, 500, "Field `clanName` can not be empty");
        return;
    }

    ClanModel
        .findOne({
            name: clanName
        })
        .then(clan => {
            if (clan == null) {
                sendApiError(res, 500, "Couldn't find clan with name: " + clanName);
                return;
            }

            let clanId = clan._id;

            CharacterModel
                .find({
                    clanId: clanId
                })
                .then(charactersInClan => {
                    UserModel
                        .find()
                        .then(users => {
                            let usersMap = {};

                            for (let i = 0; i < users.length; i++) {
                                let user = users[i];
                                usersMap[user.id] = user.username
                            }

                            let clanMembers = {};


                            for (let i = 0; i < charactersInClan.length; i++) {
                                let character = charactersInClan[i];
                                let userId = character.userId;

                                clanMembers[userId] = usersMap[userId];
                            }

                            res.send(clanMembers)
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download user list: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download character list: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download clans list: " + reason.message);
        });
});

/*
    Zwraca liste dowódców klanu (mapa userId -> username). Nalezy podac clanName
 */
router.get('/commanders', TokenValidator, function (req, res, next) {
    let clanName = req.body.clanName;

    if (clanName === undefined) {
        sendApiError(res, 500, "Field `clanName` can not be empty");
        return;
    }

    ClanModel
        .findOne({
            name: clanName
        })
        .then(clan => {
            if (clan == null) {
                sendApiError(res, 500, "Couldn't find clan with name: " + clanName);
                return;
            }

            let clanId = clan._id;

            ClanCommanderModel
                .find({
                    clanId: clanId
                })
                .then(commandersInClan => {
                    UserModel
                        .find()
                        .then(users => {
                            let usersMap = {};

                            for (let i = 0; i < users.length; i++) {
                                let user = users[i];
                                usersMap[user.id] = user.username
                            }

                            let clanCommanders = {};

                            for (let i = 0; i < commandersInClan.length; i++) {
                                let character = commandersInClan[i];
                                let userId = character.userId;

                                clanCommanders[userId] = usersMap[userId];
                            }

                            res.send(clanCommanders)
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download user list: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download character list: " + reason.message);
                });
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
            if (character == null) {
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

/*
    Dołącza użytkownika do klanu. Należy podać username. Metoda dziala wylaczenie dla clan comannder.
 */
router.post('/attach', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let username = req.body.username;

    if (username === undefined) {
        sendApiError(res, 500, "Field `username` can not be empty");
        return;
    }

    CharacterModel
        .findOne(
            {userId: ObjectId(userId)}
        )
        .then(character => {
            if (character == null) {
                sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                return;
            }

            if (character.clanId === undefined) {
                sendApiError(res, 500, "Couldn't add user to clan when you don't belong to clan");
                return;
            }

            let clanId = character.clanId;

            ClanCommanderModel
                .findOne({
                    clanId: clanId,
                    userId: userId
                })
                .then(clanCommander => {
                    if (clanCommander == null) {
                        sendApiError(res, 500, "You are not a clan commander. You can't add new players");
                        return;
                    }

                    UserModel
                        .findOne(
                            {username: username}
                        )
                        .then(user => {
                            if (user == null) {
                                sendApiError(res, 500, "Couldn't find user with username: " + username);
                                return;
                            }

                            let uId = user._id;

                            CharacterModel
                                .findOne(
                                    {userId: uId}
                                )
                                .then(characterToAdd => {
                                    if (characterToAdd == null) {
                                        sendApiError(res, 500, "Couldn't find character connected with username: " + username);
                                        return;
                                    }

                                    if (characterToAdd.clanId !== undefined && characterToAdd.clanId != null) {
                                        sendApiError(res, 500, "Couldn't add user with username: " + username + " which currently belongs to clan");
                                        return;
                                    }

                                    let query = {
                                        userId: ObjectId(uId)
                                    };

                                    CharacterModel
                                        .update(
                                            query,
                                            {clanId: clanId},
                                            function (err, data) {
                                                if (err) {
                                                    sendApiError(res, 500, "Couldn't add user to clan: " + err.message);
                                                    return;
                                                }

                                                if (data.nModified !== 1) {
                                                    sendApiError(res, 500, "Adding user error");
                                                    return;
                                                }

                                                res.send(data[0]);
                                            }
                                        )
                                })
                                .catch(reason => {
                                    sendApiError(res, 500, "Couldn't download character: " + reason.message);
                                });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download user: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download clan commander: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        });
});

/*
    Wyrzuca gracza z klanu. Nalezy podac 'username'. Tylko dla clan commander
 */
router.post('/dismiss', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let username = req.body.username;

    if (username === undefined) {
        sendApiError(res, 500, "Field `username` can not be empty");
        return;
    }

    CharacterModel
        .findOne(
            {userId: ObjectId(userId)}
        )
        .then(character => {
            if (character == null) {
                sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                return;
            }

            if (character.clanId === undefined) {
                sendApiError(res, 500, "Couldn't dismiss player when you don't belong to clan.");
                return;
            }

            let clanId = character.clanId;

            ClanCommanderModel
                .findOne({
                    clanId: clanId,
                    userId: userId
                })
                .then(clanCommander => {
                    if (clanCommander == null) {
                        sendApiError(res, 500, "You are not a clan commander. You can't dismiss players");
                        return;
                    }

                    UserModel
                        .findOne({
                            username: username
                        })
                        .then(userToDismiss => {
                            if (userToDismiss == null) {
                                sendApiError(res, 500, "Couldn't find username: " + username);
                                return;
                            }

                            let userToDismissId = userToDismiss._id;

                            CharacterModel
                                .findOne({
                                    userId: ObjectId(userToDismissId)
                                })
                                .then(characterToDismiss => {
                                    if (characterToDismiss == null) {
                                        sendApiError(res, 500, "Couldn't find character connected with username: " + username);
                                        return;
                                    }

                                    if (characterToDismiss.clanId !== clanId) {
                                        sendApiError(res, 500, "Couldn't dismiss user which don't belongs to your clan");
                                        return;
                                    }

                                    let query = {
                                        userId: ObjectId(userToDismissId)
                                    };

                                    CharacterModel
                                        .update(
                                            query,
                                            {clanId: null},
                                            function (err, data) {
                                                if (err) {
                                                    sendApiError(res, 500, "Couldn't dismiss user: " + err.message);
                                                    return;
                                                }

                                                if (data.nModified !== 1) {
                                                    sendApiError(res, 500, "Dismiss user error");
                                                    return;
                                                }

                                                ClanCommanderModel
                                                    .remove(
                                                        {userId: userToDismissId}
                                                        , function (err) {
                                                            if (err) {
                                                                sendApiError(res, 500, "Couldn't remove clan commander");
                                                                return;
                                                            }

                                                            res.send("ok")
                                                        });
                                            }
                                        );
                                })
                                .catch(reason => {
                                    sendApiError(res, 500, "Couldn't download character: " + reason.message);
                                });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download user: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download clan commander: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        })

});

/*
    Opuszcza klan. Metoda dostepna dla kazdego.
 */
router.post('/leave', TokenValidator, function (req, res, next) {
    let userId = req.userId;

    CharacterModel
        .findOne(
            {userId: ObjectId(userId)}
        )
        .then(character => {
            if (character == null) {
                sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                return;
            }

            if (character.clanId === undefined || character.clanId == null) {
                sendApiError(res, 500, "Couldn't leave clan when you don't belong to clan.");
                return;
            }

            let query = {
                userId: ObjectId(userId)
            };

            CharacterModel
                .update(
                    query,
                    {clanId: null},
                    function (err, data) {
                        if (err) {
                            sendApiError(res, 500, "Couldn't leave clan: " + err.message);
                            return;
                        }

                        if (data.nModified !== 1) {
                            sendApiError(res, 500, "Leave clan error");
                            return;
                        }

                        ClanCommanderModel
                            .remove(
                                {userId: userId}
                                , function (err) {
                                    if (err) {
                                        sendApiError(res, 500, "Couldn't remove clan commander");
                                        return;
                                    }

                                    res.send("ok")
                                });
                    }
                );
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        })
});

/*
    Promuje członka klanu na dowódcę. Należy podać username. Tylko dla dowódców klanu
 */
router.post('/promote', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let username = req.body.username;

    if (username === undefined) {
        sendApiError(res, 500, "Field `username` can not be empty");
        return;
    }

    CharacterModel
        .findOne(
            {userId: ObjectId(userId)}
        )
        .then(character => {
            if (character == null) {
                sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                return;
            }

            if (character.clanId === undefined) {
                sendApiError(res, 500, "Couldn't promote user when you don't belong to clan");
                return;
            }

            let clanId = character.clanId;

            ClanCommanderModel
                .findOne({
                    clanId: clanId,
                    userId: userId
                })
                .then(clanCommander => {
                    if (clanCommander == null) {
                        sendApiError(res, 500, "You are not a clan commander. You can't promote members");
                        return;
                    }

                    UserModel
                        .findOne(
                            {username: username}
                        )
                        .then(user => {
                            if (user == null) {
                                sendApiError(res, 500, "Couldn't find user with username: " + username);
                                return;
                            }

                            let uId = user._id;

                            CharacterModel
                                .findOne(
                                    {userId: uId}
                                )
                                .then(characterToAdd => {
                                    if (characterToAdd == null) {
                                        sendApiError(res, 500, "Couldn't find character connected with username: " + username);
                                        return;
                                    }

                                    if (characterToAdd.clanId !== clanId) {
                                        sendApiError(res, 500, "Couldn't promote user with username: " + username + " which currently don't belongs to your clan");
                                        return;
                                    }

                                    ClanCommanderModel
                                        .create({
                                            clanId: clanId,
                                            userId: uId
                                        })
                                        .then(() => {
                                            res.send("ok")
                                        })
                                        .catch(reason => {
                                            sendApiError(res, 500, "Couldn't promote user to clan commander: " + reason.message);
                                        });

                                })
                                .catch(reason => {
                                    sendApiError(res, 500, "Couldn't download character: " + reason.message);
                                });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download user: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download clan commander: " + reason.message);
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