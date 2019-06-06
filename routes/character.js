'use strict';
const express = require('express');
const bodyParser = require('body-parser');

let ObjectId = require('mongodb').ObjectId;

const CharacterModel = require('../models/Character');
const InventoryModel = require('../models/Inventory');
const ApiUtils = require('../scripts/ApiUtils');
const CharacterUtils = require('../scripts/CharacterUtils');

const TokenValidator = require('../scripts/TokenValidator');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', TokenValidator, function (req, res) {
    let userId = req.userId;
    CharacterModel.findOne({ userId: ObjectId(userId) },
        function (err, character) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu statystyk postaci: " + err.message);
                return;
            }

            if (!character || typeof character === 'undefined') {
                sendApiError(res, 404, "Nie znaleziono postaci dla uzytkownika o id: " + userId);
                return;
            }

            let experienceRequired = CharacterUtils.calcExperienceRequired(character.level);
            res.send({ character, experienceRequired });
        });
});

router.put('/', TokenValidator, function (req, res) {
    let characterId = req.body._id;

    let userId = req.userId;

    let updatedCharacter = req.body;

    CharacterModel.findOne(
        { _id: ObjectId(characterId) },
        function (err, character) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu postaci: " + err.message);
                return;
            }

            if (!character || typeof character === 'undefined') {
                sendApiError(res, 404, "Nie znaleziono postaci o id: " + characterId);
                return;
            }

            if (updatedCharacter.userId !== userId || character.userId.toString() !== userId) {
                sendApiError(res, 401, "Postac o id: " + characterId + " nie nalezy do uzytkownika o id: " + userId);
                return;
            }

            if (!CharacterUtils.validateStatistics(character.statistics, updatedCharacter.statistics)) {
                sendApiError(res, 409, "Niepoprawnie rozdzielone punkty statystyk dla postaci o id: " + characterId);
                return;
            }

            while (updatedCharacter.experience >= CharacterUtils.calcExperienceRequired(updatedCharacter.level)) {
                updatedCharacter = CharacterUtils.levelUpCharacter(updatedCharacter);
            }

            CharacterModel.updateOne(
                { _id: ObjectId(character._id) },
                updatedCharacter, //In case of level up, do I need to JSON.Stringify?
                { new: true, upsert: true, setDefaultsOnInsert: false },
                function (err, updatedCharacter) {
                    if (err) {
                        sendApiError(res, 500, "Wystapil blad przy aktualizowaniu statystyk postaci: " + err.message);
                        return;
                    }
                    CharacterModel.findOne({ userId: ObjectId(userId) }, function (err, character) {

                        let experienceRequired = CharacterUtils.calcExperienceRequired(character.level);
                        res.send({ character, experienceRequired });
                    });
                });


        });
});

router.post('/', TokenValidator, function (req, res) {
    let userId = req.userId;

    CharacterModel.find(
        { userId: ObjectId(userId) },
        function (err, characters) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu statystyk postaci: " + err.message);
                return;
            }
            if (characters.length !== 0) {
                sendApiError(res, 500, "Istnieje juz postac dla uzytkownika o id: " + userId);
                return;
            }

            let character = CharacterUtils.createNewCharacter(userId);

            CharacterModel
                .create(character)
                .then(dep => {
                    CharacterModel.find({ userId: req.userId }, function (err, e) {
                        if (err) {
                            sendApiError(res, 500, "Wystapil blad przy pobieraniu postaci: " + err.message);
                            return;
                        }

                        res.send(e);
                    });
                })
                .catch(err => {
                    sendApiError(res, 500, "Wystapil problem przy tworzeniu postaci: " + err.message);
                });
        });

});

router.put('/equip', TokenValidator, function (req, res) {
    let userId = req.userId;
    let itemId = req.body.itemId;

    InventoryModel.find(
        { itemId: itemId })
        .then(items => {
            if (items.length !== 1) {
                sendApiError(res, 500, "Couldn't find item with id: " + itemId);
                return;
            }
            let itemClass = items[0].itemClass;
            InventoryModel.find(
                {
                    itemClass: itemClass,
                    userId: userId
                }
            ).then(itemsEquipped => {
                // if (itemsEquipped.length === 1) {
                //     InventoryModel.update({itemId: itemsEquipped[0].itemId },
                //         {equipped: false})
                //         .then(() => {
                //             return;
                //         })
                //         .catch(err => {
                //             sendApiError("Couldn't unequip already equipped item: " + err.message);
                //         });
                // } else 
                if (itemsEquipped.length > 1) { //think I can do both in one version (loop)
                    itemsEquipped.forEach(element => {
                        InventoryModel.update({ itemId: element.itemId, userId: userId },
                            { equipped: false })
                            .then(() => {
                                return;
                            })
                            .catch(err => {
                                sendApiError("Couldn't unequip already equipped item: " + err.message);
                            });
                    });
                }
                InventoryModel.update({
                    itemId: itemId,
                    userId: userId},
                { equipped: true },
                function (err, data) {
                    if (err) {
                        sendApiError(res, 500, "Couldn't equip item: " + err.message);
                        return;
                    }

                    if (data.nModified !== 1) {
                        sendApiError(res, 500, "Updating (Equipping) item error");
                        return;
                    }

                    res.send(data[0]);
                });
            }).catch(err => {
                sendApiError(res, 500, "Couldn't find items of this class for user: " + err.message);
            });
        }).catch(err => {
            sendApiError(res, 500, "Couldn't download item: " + err.message);
        });
    return;
});

router.put('/unequip', TokenValidator, function (req, res) {
    let userId = req.userId;
    let itemId = req.body.itemId;

    InventoryModel.find({
        itemId: itemId,
        userId: userId }
    ).then(items => {
        if (items.length !== 1) {
            sendApiError(res, 500, "Couldn't find item with id: " + itemId);
            return;
        }
        if (items[0].equipped === false) {
            sendApiError(res, 500, "Item already not equipped, item id: " + itemId);
            return;
        } 

        InventoryModel.update(
            {itemId: itemId, userId: userId},
            { equipped: true },
            function (err, data) {
                if (err) {
                    sendApiError(res, 500, "Couldn't unequip item with id: " + itemId);
                    return;
                }
                if (data.nModified !== 1) {
                    sendApiError(res, 500, "Updating (unequipping) item error");
                    return;
                }
                res.send(data[0]);
            }
        );
    }).catch(err => {
        sendApiError(res, 500, "Couldn't download item: " + err.message);
    });
});

function sendApiError(res, code, message) {
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}
module.exports = router;