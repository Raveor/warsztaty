'use strict';
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

let ObjectId = require('mongodb').ObjectId;

const CharacterModel = require('../models/Character');
const UserModel = require('../models/User');
const ClanModel = require('../models/Clan');
const ClanCommanderModel = require('../models/ClanCommander');
const ClanMessageModel = require('../models/ClanMessage');
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
    Zwraca klan do którego należymy
 */
router.get('/my', TokenValidator, function (req, res, next) {
    CharacterModel
        .find({userId: mongoose.Types.ObjectId(req.userId)})
        .then(character => {
            if (character.length > 0) {
                ClanModel.findById(character[0].clanId).then(clan => {
                    if (clan === null) {
                        sendApiError(res, 500, "You don't belong to clan");
                    }
                    res.send(clan);
                })
                    .catch(reason => {
                        sendApiError(res, 500, "Couldn't find clan " + reason.message);
                    });
            } else {

            }
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't find user " + reason.message);
        });
});

/*
    Zwraca liste czlonkow klanu jako Character model. Nalezy podac clanName jako param.
 */
router.get('/members', TokenValidator, function (req, res, next) {
    let clanName = req.query.clanName;

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
                .populate('userId')
                .then(charactersInClan => {
                    res.send(charactersInClan);
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
    Zwraca liste dowódców klanu jako listę Character. Nalezy podac clanName jako param
 */
router.get('/commanders', TokenValidator, function (req, res, next) {
    let clanName = req.query.clanName;

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
                    res.send(commandersInClan)

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
router.post('/create', TokenValidator, function (req, res) {
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

            if (character.clanId !== undefined && character.clanId != null) {
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

            if (character.clanId === undefined || character.clanId == null) {
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

            if (character.clanId === undefined || character.clanId == null) {
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

            if (character.clanId === undefined || character.clanId == null) {
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


/*
    Metoda umozliwia doplacanie pieniedzy do konta klanu. Nalezy podac moneyAmount
 */
router.post('/pay', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let moneyAmount = req.body.moneyAmount;

    if (moneyAmount === undefined) {
        sendApiError(res, 500, "Field `moneyAmount` can not be empty");
        return;
    }

    let moneyAmountInt = parseInt(moneyAmount);

    if (isNaN(moneyAmountInt) || !isFinite(moneyAmountInt)) {
        sendApiError(res, 500, "Field `moneyAmount` can not be convert to correct value");
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

            if (character.clanId === undefined || character.clanId == null) {
                sendApiError(res, 500, "Couldn't pay money to clan when you don't belong to clan");
                return;
            }

            let clanId = character.clanId;
            let money = character.money;

            if (moneyAmountInt > money) {
                sendApiError(res, 500, "You don't have enough money. You want to pay " + moneyAmountInt + " but you have only " + money);
                return;
            }

            ClanModel
                .findOne({_id: ObjectId(clanId)})
                .then(clan => {
                    if (clan == null) {
                        sendApiError(res, 500, "Couldn't find clan with clanId: " + clanId);
                        return;
                    }

                    let clanMoney = clan.money;

                    let query = {
                        _id: ObjectId(clanId)
                    };

                    ClanModel
                        .update(
                            query,
                            {money: clanMoney + moneyAmountInt},
                            function (err, data) {
                                if (err) {
                                    sendApiError(res, 500, "Couldn't update clan money: " + err.message);
                                    return;
                                }

                                if (data.nModified !== 1) {
                                    sendApiError(res, 500, "Updating clan money error");
                                    return;
                                }

                                let characterQuery = {
                                    userId: ObjectId(userId)
                                };

                                CharacterModel
                                    .update(
                                        characterQuery,
                                        {money: money - moneyAmountInt},
                                        function (err, data) {
                                            if (err) {
                                                sendApiError(res, 500, "Couldn't update character money: " + err.message);
                                                return;
                                            }

                                            if (data.nModified !== 1) {
                                                sendApiError(res, 500, "Updating character money error");
                                                return;
                                            }

                                            res.send({money: clanMoney + moneyAmountInt})
                                        });
                            });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download clan: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        });
});

/*
    Motoda umozliwiaja rozbudowe kosciola klanowego. Metoda tylko dla dowodcow.
 */
router.post('/upgrade/church', TokenValidator, function (req, res, next) {
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
                sendApiError(res, 500, "Couldn't upgrade building when you don't belong to clan");
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
                        sendApiError(res, 500, "You are not a clan commander. You can't upgrade buildings");
                        return;
                    }

                    ClanModel
                        .findOne({_id: ObjectId(clanId)})
                        .then(clan => {
                            if (clan == null) {
                                sendApiError(res, 500, "Couldn't find clan with clanId: " + clanId);
                                return;
                            }

                            let clanMoney = clan.money;
                            let clanBuilding = clan.buildings;
                            let clanRank = clanBuilding.church + clanBuilding.castle + clanBuilding.wall + clanBuilding.arsenal + clanBuilding.storage;

                            let buildingLevel = clan.buildings.church;

                            let upgradeCost = (buildingLevel + 1) * 1000;

                            if (upgradeCost > clanMoney) {
                                sendApiError(res, 500, "Your clan doesn't have enough money. Upgrade cost " + upgradeCost + " but your clan have only " + clanMoney);
                                return;
                            }

                            let query = {
                                _id: ObjectId(clanId)
                            };

                            ClanModel
                                .update(
                                    query,
                                    {
                                        money: clanMoney - upgradeCost,
                                        rank: clanRank + 1,
                                        buildings: {
                                            church: clanBuilding.church + 1,
                                            castle: clanBuilding.castle,
                                            wall: clanBuilding.wall,
                                            arsenal: clanBuilding.arsenal,
                                            storage: clanBuilding.storage
                                        }
                                    },
                                    function (err, data) {
                                        if (err) {
                                            sendApiError(res, 500, "Couldn't upgrade clan church: " + err.message);
                                            return;
                                        }

                                        if (data.nModified !== 1) {
                                            sendApiError(res, 500, "Upgrading clan building error");
                                            return;
                                        }

                                        res.send("ok")
                                    });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download clan: " + reason.message);
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
    Motoda umozliwiaja rozbudowe zamku klanowego. Metoda tylko dla dowodcow.
 */
router.post('/upgrade/castle', TokenValidator, function (req, res, next) {
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
                sendApiError(res, 500, "Couldn't upgrade building when you don't belong to clan");
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
                        sendApiError(res, 500, "You are not a clan commander. You can't upgrade buildings");
                        return;
                    }

                    ClanModel
                        .findOne({_id: ObjectId(clanId)})
                        .then(clan => {
                            if (clan == null) {
                                sendApiError(res, 500, "Couldn't find clan with clanId: " + clanId);
                                return;
                            }

                            let clanMoney = clan.money;
                            let clanBuilding = clan.buildings;
                            let clanRank = clanBuilding.church + clanBuilding.castle + clanBuilding.wall + clanBuilding.arsenal + clanBuilding.storage;

                            let buildingLevel = clan.buildings.castle;

                            let upgradeCost = (buildingLevel + 1) * 1000;

                            if (upgradeCost > clanMoney) {
                                sendApiError(res, 500, "Your clan doesn't have enough money. Upgrade cost " + upgradeCost + " but your clan have only " + clanMoney);
                                return;
                            }

                            let query = {
                                _id: ObjectId(clanId)
                            };

                            ClanModel
                                .update(
                                    query,
                                    {
                                        money: clanMoney - upgradeCost,
                                        rank: clanRank + 1,
                                        buildings: {
                                            church: clanBuilding.church,
                                            castle: clanBuilding.castle + 1,
                                            wall: clanBuilding.wall,
                                            arsenal: clanBuilding.arsenal,
                                            storage: clanBuilding.storage
                                        }
                                    },
                                    function (err, data) {
                                        if (err) {
                                            sendApiError(res, 500, "Couldn't upgrade clan castle: " + err.message);
                                            return;
                                        }

                                        if (data.nModified !== 1) {
                                            sendApiError(res, 500, "Upgrading clan building error");
                                            return;
                                        }

                                        res.send("ok")
                                    });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download clan: " + reason.message);
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
    Motoda umozliwiaja rozbudowe muru klanowego. Metoda tylko dla dowodcow.
 */
router.post('/upgrade/wall', TokenValidator, function (req, res, next) {
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
                sendApiError(res, 500, "Couldn't upgrade building when you don't belong to clan");
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
                        sendApiError(res, 500, "You are not a clan commander. You can't upgrade buildings");
                        return;
                    }

                    ClanModel
                        .findOne({_id: ObjectId(clanId)})
                        .then(clan => {
                            if (clan == null) {
                                sendApiError(res, 500, "Couldn't find clan with clanId: " + clanId);
                                return;
                            }

                            let clanMoney = clan.money;
                            let clanBuilding = clan.buildings;
                            let clanRank = clanBuilding.church + clanBuilding.castle + clanBuilding.wall + clanBuilding.arsenal + clanBuilding.storage;

                            let buildingLevel = clan.buildings.wall;

                            let upgradeCost = (buildingLevel + 1) * 1000;

                            if (upgradeCost > clanMoney) {
                                sendApiError(res, 500, "Your clan doesn't have enough money. Upgrade cost " + upgradeCost + " but your clan have only " + clanMoney);
                                return;
                            }

                            let query = {
                                _id: ObjectId(clanId)
                            };

                            ClanModel
                                .update(
                                    query,
                                    {
                                        money: clanMoney - upgradeCost,
                                        rank: clanRank + 1,
                                        buildings: {
                                            church: clanBuilding.church,
                                            castle: clanBuilding.castle,
                                            wall: clanBuilding.wall + 1,
                                            arsenal: clanBuilding.arsenal,
                                            storage: clanBuilding.storage
                                        }
                                    },
                                    function (err, data) {
                                        if (err) {
                                            sendApiError(res, 500, "Couldn't upgrade clan wall: " + err.message);
                                            return;
                                        }

                                        if (data.nModified !== 1) {
                                            sendApiError(res, 500, "Upgrading clan building error");
                                            return;
                                        }

                                        res.send("ok")
                                    });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download clan: " + reason.message);
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
    Motoda umozliwiaja rozbudowe arsenalu klanowego. Metoda tylko dla dowodcow.
 */
router.post('/upgrade/arsenal', TokenValidator, function (req, res, next) {
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
                sendApiError(res, 500, "Couldn't upgrade building when you don't belong to clan");
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
                        sendApiError(res, 500, "You are not a clan commander. You can't upgrade buildings");
                        return;
                    }

                    ClanModel
                        .findOne({_id: ObjectId(clanId)})
                        .then(clan => {
                            if (clan == null) {
                                sendApiError(res, 500, "Couldn't find clan with clanId: " + clanId);
                                return;
                            }

                            let clanMoney = clan.money;
                            let clanBuilding = clan.buildings;
                            let clanRank = clanBuilding.church + clanBuilding.castle + clanBuilding.wall + clanBuilding.arsenal + clanBuilding.storage;

                            let buildingLevel = clan.buildings.arsenal;

                            let upgradeCost = (buildingLevel + 1) * 1000;

                            if (upgradeCost > clanMoney) {
                                sendApiError(res, 500, "Your clan doesn't have enough money. Upgrade cost " + upgradeCost + " but your clan have only " + clanMoney);
                                return;
                            }

                            let query = {
                                _id: ObjectId(clanId)
                            };

                            ClanModel
                                .update(
                                    query,
                                    {
                                        money: clanMoney - upgradeCost,
                                        rank: clanRank + 1,
                                        buildings: {
                                            church: clanBuilding.church,
                                            castle: clanBuilding.castle,
                                            wall: clanBuilding.wall,
                                            arsenal: clanBuilding.arsenal + 1,
                                            storage: clanBuilding.storage
                                        }
                                    },
                                    function (err, data) {
                                        if (err) {
                                            sendApiError(res, 500, "Couldn't upgrade clan arsenal: " + err.message);
                                            return;
                                        }

                                        if (data.nModified !== 1) {
                                            sendApiError(res, 500, "Upgrading clan building error");
                                            return;
                                        }

                                        res.send("ok")
                                    });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download clan: " + reason.message);
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
    Motoda umozliwiaja rozbudowe skladu klanowego. Metoda tylko dla dowodcow.
 */
router.post('/upgrade/storage', TokenValidator, function (req, res, next) {
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
                sendApiError(res, 500, "Couldn't upgrade building when you don't belong to clan");
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
                        sendApiError(res, 500, "You are not a clan commander. You can't upgrade buildings");
                        return;
                    }

                    ClanModel
                        .findOne({_id: ObjectId(clanId)})
                        .then(clan => {
                            if (clan == null) {
                                sendApiError(res, 500, "Couldn't find clan with clanId: " + clanId);
                                return;
                            }

                            let clanMoney = clan.money;
                            let clanBuilding = clan.buildings;
                            let clanRank = clanBuilding.church + clanBuilding.castle + clanBuilding.wall + clanBuilding.arsenal + clanBuilding.storage;

                            let buildingLevel = clan.buildings.storage;

                            let upgradeCost = (buildingLevel + 1) * 1000;

                            if (upgradeCost > clanMoney) {
                                sendApiError(res, 500, "Your clan doesn't have enough money. Upgrade cost " + upgradeCost + " but your clan have only " + clanMoney);
                                return;
                            }

                            let query = {
                                _id: ObjectId(clanId)
                            };

                            ClanModel
                                .update(
                                    query,
                                    {
                                        money: clanMoney - upgradeCost,
                                        rank: clanRank + 1,
                                        buildings: {
                                            church: clanBuilding.church,
                                            castle: clanBuilding.castle,
                                            wall: clanBuilding.wall,
                                            arsenal: clanBuilding.arsenal,
                                            storage: clanBuilding.storage + 1
                                        }
                                    },
                                    function (err, data) {
                                        if (err) {
                                            sendApiError(res, 500, "Couldn't upgrade clan storage: " + err.message);
                                            return;
                                        }

                                        if (data.nModified !== 1) {
                                            sendApiError(res, 500, "Upgrading clan building error");
                                            return;
                                        }

                                        res.send("ok")
                                    });
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download clan: " + reason.message);
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
    Metoda umozliwiajaca wyswietlenie wiadomosci z klanowego chatu. Zwraca obiekt: timestamp, username, message
 */
router.get('/chat', TokenValidator, function (req, res, next) {
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
                sendApiError(res, 500, "Couldn't add message to clan's chat when you don't belong to clan");
                return;
            }

            let clanId = character.clanId;

            UserModel
                .find()
                .then(users => {
                    let usersMap = {};

                    for (let i = 0; i < users.length; i++) {
                        let user = users[i];
                        usersMap[user.id] = user.username
                    }

                    ClanMessageModel
                        .find({
                            clanId: clanId
                        })
                        .sort({
                            timestamp: 'desc'
                        })
                        .then(messages => {
                            let modifiedMessages = [];

                            for (let j = 0; j < messages.length; j++) {
                                let message = messages[j];
                                modifiedMessages.push({
                                    "timestamp": message.timestamp,
                                    "username": usersMap[message.userId],
                                    "message": message.message
                                });
                            }

                            res.send(modifiedMessages)
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download clan chat messages: " + reason.message);
                        })
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download users: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download character: " + reason.message);
        })
});

/*
    Metoda umozliwiajaca wyslanie wiadomosci na czat klanowy. Wymaga podania 'message'
 */
router.post('/chat/add', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let message = req.body.message;

    if (message === undefined) {
        sendApiError(res, 500, "Field `message` can not be empty");
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

            if (character.clanId === undefined || character.clanId == null) {
                sendApiError(res, 500, "Couldn't add message to clan's chat when you don't belong to clan");
                return;
            }

            let clanId = character.clanId;
            let timestamp = new Date().getTime();

            ClanMessageModel
                .create({
                    clanId: clanId,
                    userId: userId,
                    timestamp: timestamp,
                    message: message
                })
                .then(message => {
                    res.send(message)
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't add message to clan's chat: " + reason.message);
                })
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