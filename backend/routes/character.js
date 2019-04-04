'use strict';
const express = require('express');
const router = express.Router();

const CharacterModel = require('../models/Character');

router.get('/character', function (req, res) {
    let characterId = req.body.characterId;
    CharacterModel.findById(characterId,
        function (err, character) {
            if (err) {

            }
            else {

            }
        });
})

router.post('/character', function (req, res) {

})

module.exports = router;