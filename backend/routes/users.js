'use strict';
const express = require('express');
const router = express.Router();

const TokenValidator = require('../scripts/TokenValidator');

router.get('/', TokenValidator, function (req, res, next) {
    res.send('Super tajne dane chronione tokenem dla usera o id: ' + req.userId);
});

module.exports = router;