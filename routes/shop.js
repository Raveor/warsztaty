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
                                    res.send(weapon)
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

router.get('/inventory', TokenValidator, function (req, res, next) {
    let userId = req.userId;

    WeaponModel
        .find()
        .then(weapons => {
            OutfitModel
                .find()
                .then(outfits => {
                    InventoryModel
                        .find({userId: userId})
                        .then(items => {
                            let weaponsMap = {};
                            let outfitsMap = {};
                            for (let i = 0; i < weapons.length; i++) {
                                let w = weapons[i];
                                weaponsMap[w.weaponId] = w;
                            }
                            for (let i = 0; i < outfits.length; i++) {
                                let o = outfits[i];
                                outfitsMap[o.outfitId] = o;
                            }

                            let userItems = [];
                            for (let i = 0; i < items.length; i++) {
                                let item = items[i];
                                if (item.itemCategory === "W") {
                                    userItems.push(weaponsMap[item.itemId])
                                } else {
                                    userItems.push(outfitsMap[item.itemId])
                                }
                            }

                            res.send(userItems)
                        })
                        .catch(reason => {
                            sendApiError(res, 500, "Couldn't download inventory: " + reason.message);
                        })
                })
                .catch(reason => {
                    sendApiError(res, 500, "Couldn't download outfits: " + reason.message);
                });

        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download weapons: " + reason.message);
        });
});

router.post('/inventory/sell', TokenValidator, function (req, res, next) {
    let userId = req.userId;
    let itemId = req.body.itemId;

    if (itemId === undefined) {
        sendApiError(res, 500, "Field 'itemId' couldn't be empty.");
        return;
    }

    InventoryModel
        .find({userId: userId, _id: ObjectId(itemId)})
        .then(items => {

            console.log(items)
            if (items.length !== 1) {
                sendApiError(res, 500, "Error with inventory item");
                return;
            }

            let item = items[0];
            let localId = item.itemId;

            if (item.itemCategory === "W") {
                WeaponModel
                    .find()
                    .then(weapons => {
                        for (let i = 0; i < weapons.length; i++) {
                            let weapon = weapons[i];
                            if (weapon.weaponId === localId) {
                                CharacterModel
                                    .find({userId: ObjectId(userId)})
                                    .then(characters => {
                                        if (characters.length !== 1) {
                                            sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                                            return;
                                        }
                                        let newMoney = characters[0].money + weapon.price;

                                        let query = {
                                            userId: ObjectId(userId),
                                        };

                                        CharacterModel
                                            .update(
                                                query,
                                                {money: newMoney}
                                            )
                                            .then(mon => {
                                                InventoryModel
                                                    .remove(
                                                        {_id: ObjectId(itemId)}
                                                        , function (err) {
                                                            if (err) {
                                                                sendApiError(res, 500, "Couldn't remove item.");
                                                                return;
                                                            }

                                                            res.send("ok");
                                                        });
                                            })
                                            .catch(reason => {
                                                sendApiError(res, 500, "Couldn't update character money: " + reason.message);
                                            });
                                    })
                                    .catch(reason => {
                                        sendApiError(res, 500, "Couldn't download character: " + reason.message);
                                    });
                                return;
                            }
                        }
                        sendApiError(res, 500, "Couldn't sell item");
                    })
                    .catch(reason => {
                        sendApiError(res, 500, "Couldn't download weapons: " + reason.message);
                    })
            } else {
                OutfitModel
                    .find()
                    .then(outfits => {
                        for (let i = 0; i < outfits.length; i++) {
                            let outfit = outfits[i];
                            if (outfit.outfitId === localId) {
                                CharacterModel
                                    .find({userId: ObjectId(userId)})
                                    .then(characters => {
                                        if (characters.length !== 1) {
                                            sendApiError(res, 500, "Couldn't find character with userId: " + userId);
                                            return;
                                        }
                                        let newMoney = characters[0].money + outfit.price;

                                        let query = {
                                            userId: ObjectId(userId),
                                        };

                                        CharacterModel
                                            .update(
                                                query,
                                                {money: newMoney}
                                            )
                                            .then(mon => {
                                                InventoryModel
                                                    .remove(
                                                        {_id: ObjectId(itemId)}
                                                        , function (err) {
                                                            if (err) {
                                                                sendApiError(res, 500, "Couldn't remove item.");
                                                                return;
                                                            }

                                                            res.send("ok");
                                                        });
                                            })
                                            .catch(reason => {
                                                sendApiError(res, 500, "Couldn't update character money: " + reason.message);
                                            });
                                    })
                                    .catch(reason => {
                                        sendApiError(res, 500, "Couldn't download character: " + reason.message);
                                    });
                                return;
                            }
                        }
                        sendApiError(res, 500, "Couldn't sell item");
                    })
                    .catch(reason => {
                        sendApiError(res, 500, "Couldn't download weapons: " + reason.message);
                    })
            }
        })
        .catch(reason => {
            sendApiError(res, 500, "Couldn't download inventory: " + reason.message);
        })
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
                                    res.send(outfit)
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

function sendApiError(res, code, message) {
    res
        .status(code)
        .send(JSON.stringify(ApiUtils.getApiError(message)))
        .end();
}

module.exports = router;