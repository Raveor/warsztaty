'use strict';
const express = require('express');
const router = express.Router();

const TokenValidator = require('../scripts/TokenValidator');

const User = require('../models/User');
const ExpeditionModel = require('../models/Expedition');

router.get('/', TokenValidator, function (req, res, next) {
    res.send('Super tajne dane chronione tokenem dla usera o id: ' + req.userId);
});

router.get('/all', TokenValidator, function (req, res) {
    User.find({}, function(err, users){
        if (err) {
            sendApiError(res, 500, "Wystapil blad przy pobieraniu listy urzytkownikow: " + err.message);
            return;
        }

        res.send(users);
    });
});

module.exports = router;