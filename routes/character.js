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
            res.send(characters[0]);

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

            if ( !character || typeof character === 'undefined') { 
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

            while (updatedCharacter.experience >= updatedCharacter.experienceRequired) {
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

                    sendOkResult(res);
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