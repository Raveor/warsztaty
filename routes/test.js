'use strict';
var express = require('express');
var router = express.Router();

//ROUTER ONLY FOR TESTS

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Testowa strona!!!'});
});

router.get('/google', function (req, res) {
    res.render('test_google', {title: 'Testowa strona Google!!!'});
});

router.get('/google/merge', function (req, res) {
    res.render('test_merge_google', {title: 'Testowa strona Merge Google!!!'});
});

module.exports = router;