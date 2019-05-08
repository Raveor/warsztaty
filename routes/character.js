'use strict';
const express = require('express');
const bodyParser = require('body-parser');

let ObjectId = require('mongodb').ObjectId;

const CharacterModel = require('../models/Character');
const ApiUtils = require('../scripts/ApiUtils');
const CharacterUtils = require('../scripts/CharacterUtils');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/character', function (req, res) {
    let userId = req.userId;
    CharacterModel.find({ userId: ObjectId(userId) },
        function (err, characters) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu statystyk postaci: " + err.message);
                return;
            }
            res.send(characters[0])

        });
});

// router.post('/character', function (req, res) {
//     let characterId = req.body.characterId;
//     CharacterModel.findById
// })

router.put('/character/{id}', function (req, res) {
    let characterId = req.body.characterId;
    let userId = req.userId;
    let updatedCharacter = req.body;

    CharacterModel.find(
        { _id: ObjectId(characterId) },
        function (err, characters) {
            if (err) {
                sendApiError(res, 500, "Wystapil blad przy pobieraniu postaci: " + err.message);
                return;
            }

            if (character.length === 0) {
                sendApiError(res, 500, "Nie znaleziono postaci o id: " + characterId);
                return;
            }

            let character = characters[0];

            if (character.userId !== userId) {
                sendApiError(res, 500, "Postaco id: " + characterId + " nie nalezy do uzytkownika o id: " + userId);
                return;
            }

            CharacterModel.update(
                { _id: ObjectId(character._id) },
                updatedCharacter,
                { new: true, upsert: true, setDefaultsOnInsert: false },
                function (err, updCharacter) {
                    if (err) {
                        sendApiError(res, 500, "Wystapil blad przy aktualizowaniu statystyk postaci: " + err.message);
                        return;
                    }

                    res.write(data);
                    sendOkResult(res)
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