'use strict';
var express = require('express');
var router = express.Router();

//ROUTER ONLY FOR TESTS

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Testowa strona!!!' });
});

router.get('/google', function (req, res) {
    res.render('test_google', { title: 'Testowa strona Google!!!' });
});

module.exports = router;