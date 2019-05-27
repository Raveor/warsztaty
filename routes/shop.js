'use strict';
const express = require('express');
const router = express.Router();

let ObjectId = require('mongodb').ObjectId;

const OutfitModel = require('../models/Outfit');
const WeaponModel = require('../models/Weapon');
const InventoryModel = require('../models/Inventory');
const CharacterModel = require('../models/Character');

const ShopUtils = require('../scripts/ShopUtils');
const ApiUtils = require('../scripts/ApiUtils');

const TokenValidator = require('../scripts/TokenValidator');

/*
    Pobiera listę dostępnych broni w sklepie
 */
router.get('/weapons', TokenValidator, function (req, res, next) {
    WeaponModel
        .find()
        .then(weapons => {
            //TODO mozna dodac obsluge dodania nowych broni - jezeli w bazie jest inna ilosc niz w utils - wtedy usun i dodaj od nowa
            if (weapons.length === 0) {
                WeaponModel
                    .insertMany(ShopUtils.getWeapons())
                    .then(value => {
                        WeaponModel
                            .find()
                            .then(addedWeapons => {
                                res.send(addedWeapons)
                            })
                            .catch(reason => {
                                sendApiError(res, 500, "Couldn't download weapons list: " + reason.message);
                            });
                    })
                    .catch(reason => {
                        sendApiError(res, 500, "Couldn't create weapons: " + reason.message);
                    });
            } else {
                res.send(weapons)
            }
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download weapons list: " + reason.message);
        });
});

/*
    Kupuje bron. Wymaga weaponId
 */
router.post('/weapons/buy', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let weaponId = req.body.weaponId;

    if (weaponId === undefined) {
        sendApiError(res, 500, "Field 'weaponId' couldn't be empty.");
        return;
    }

    WeaponModel
        .find({
            weaponId: weaponId
        })
        .then(weapons => {
            if (weapons.length !== 1) {
                sendApiError(res, 500, "Couldn't find weapon with id: " + weaponId);
                return;
            }
            let weapon = weapons[0];
            let weaponPrice = weapon.price;

            CharacterModel
                .find({
                    userId: ObjectId(userId)
                })
                .then(characters => {
                    if (characters.length !== 1) {
                        sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                        return;
                    }
                    let character = characters[0];
                    let money = character.money;

                    if (money < weaponPrice) {
                        sendApiError(res, 500, "Couldn't buy weapon. Not enough money. You have " + money + " but weapon costs " + weaponPrice);
                        return;
                    }

                    InventoryModel
                        .create({
                            userId: userId,
                            itemId: weaponId,
                            itemCategory: "W"
                        })
                        .then(inv => {
                            let query = {
                                userId: ObjectId(userId),
                            };

                            let newMoney = money - weaponPrice;

                            CharacterModel
                                .update(
                                    query,
                                    {money: newMoney}
                                )
                                .then(mon => {
                                    sendOkResult(res)
                                })
                                .catch(reason => {
                                    sendApiError(res, 500, "Couldn't update character money: " + reason.message);
                                })
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't add new weapon to inventory: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download character: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download weapon: " + reason.message);
        });
});

/*
    Pobiera liste dostepnych ubran w sklepie. Kazde ubranie ma jedna z kategorii:
    A(rmour) - zbroje
    H(elmet) - helm
    S(hoes) - buty
    P(ants) - spodnie
 */
router.get('/outfits', TokenValidator, function (req, res, next) {
    OutfitModel
        .find()
        .then(outfits => {
            //TODO mozna dodac obsluge dodania nowych strojow - jezeli w bazie jest inna ilosc niz w utils - wtedy usun i dodaj od nowa
            if (outfits.length === 0) {
                OutfitModel
                    .insertMany(ShopUtils.getOutfits())
                    .then(value => {
                        OutfitModel
                            .find()
                            .then(addedOutfits => {
                                res.send(addedOutfits)
                            })
                            .catch(reason => {
                                sendApiError(res, 500, "Couldn't download outfits list: " + reason.message);
                            });
                    })
                    .catch(reason => {
                        sendApiError(res, 500, "Couldn't create outfits: " + reason.message);
                    });
            } else {
                res.send(outfits)
            }
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download outfits list: " + reason.message);
        });
});

/*
    Kupuje stroj. Wymaga userId oraz outfitId
 */
router.post('/outfits/buy', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let outfitId = req.body.outfitId;

    if (outfitId === undefined) {
        sendApiError(res, 500, "Field 'outfitId' couldn't be empty.");
        return;
    }

    OutfitModel
        .find({
            outfitId: outfitId
        })
        .then(outfits => {
            if (outfits.length !== 1) {
                sendApiError(res, 500, "Couldn't find outfit with id: " + outfitId);
                return;
            }
            let outfit = outfits[0];
            let outfitPrice = outfit.price;

            CharacterModel
                .find({
                    userId: ObjectId(userId)
                })
                .then(characters => {
                    if (characters.length !== 1) {
                        sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                        return;
                    }
                    let character = characters[0];
                    let money = character.money;

                    if (money < outfitPrice) {
                        sendApiError(res, 500, "Couldn't buy outfit. Not enough money. You have " + money + " but outfit costs " + outfitPrice);
                        return;
                    }

                    InventoryModel
                        .create({
                            userId: userId,
                            itemId: outfitId,
                            itemCategory: "O"
                        })
                        .then(inv => {
                            let query = {
                                userId: ObjectId(userId),
                            };

                            let newMoney = money - outfitPrice;

                            CharacterModel
                                .update(
                                    query,
                                    {money: newMoney}
                                )
                                .then(mon => {
                                    sendOkResult(res)
                                })
                                .catch(reason => {
                                    sendApiError(res, 500, "Couldn't update character money: " + reason.message);
                                })
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't add new outfit to inventory: " + reason.message);
                        });
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download character: " + reason.message);
                });
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download outfit: " + reason.message);
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