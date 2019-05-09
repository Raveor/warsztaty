'use strict';
const express = require('express');
const bodyParser = require('body-parser');

let ObjectId = require('mongodb').ObjectId;

const CharacterModel = require('../models/Character');
const ApiUtils = require('../scripts/ApiUtils');
const CharacterUtils = require('../scripts/CharacterUtils');

const TokenValidator = require('../scripts/TokenValidator');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', TokenValidator, function (req, res) {
    let userId = req.userId;
    CharacterModel.find({ userId: ObjectId(userId) },
        function (err, characters) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu statystyk postaci: " + err.message);
                return;
            }
            if (characters.length === 0) {
                sendApiError(res, 404, "Nie znaleziono postaci dla uzytkownika o id: " + userId);
                return;
            }
            res.send(characters[0])

        });
});

router.put('/update', TokenValidator, function (req, res) {
    let characterId = req.body._id;

    let userId = req.userId;
    let updatedCharacter = req.body;

    CharacterModel.find(
        { _id: ObjectId(characterId) },
        function (err, characters) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu postaci: " + err.message);
                return;
            }

            if (characters.length === 0) {
                sendApiError(res, 404, "Nie znaleziono postaci o id: " + characterId);
                return;
            }

            let character = characters[0];

            if (character.userId != userId) {
                sendApiError(res, 401, "Postac o id: " + characterId + " nie nalezy do uzytkownika o id: " + userId);
                return;
            }

            CharacterModel.updateOne(
                { _id: ObjectId(character._id) },
                updatedCharacter,
                { new: true, upsert: true, setDefaultsOnInsert: false },
                function (err, updatedCharacter) {
                    if (err) {
                        sendApiError(res, 500, "Wystapil blad przy aktualizowaniu statystyk postaci: " + err.message);
                        return;
                    }

                    sendOkResult(res)
                });

        });
});

router.post('/add', TokenValidator, function (req, res) {
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
                })
        });



})
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