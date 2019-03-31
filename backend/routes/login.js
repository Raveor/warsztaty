'use strict';
var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

const EmailUtils = require('../scripts/EmailUtils.js');
const ApiUtils = require('../scripts/ApiUtils.js');

router.post('/register', function (req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    if (name === undefined || name === "") {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError(("Pole 'imie' nie moze byc puste!"))))
            .end();
        return;
    }

    if (name.length < 3) {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'imie' musi miec przynajmniej 3 znaki!")))
            .end();
        return;
    }

    if (email === undefined || email === "") {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'email' nie moze byc puste!")))
            .end();
        return;
    }

    if (!EmailUtils.validate(email)) {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'email' nie spelnia wymogow!")))
            .end();
        return;
    }

    if (username === undefined || username === "") {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError(("Pole 'login' nie moze byc puste!"))))
            .end();
        return;
    }

    if (username.length < 3) {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'login' musi miec przynajmniej 3 znaki!")))
            .end();
        return;
    }

    if (password === undefined || password === "") {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError(("Pole 'haslo' nie moze byc puste!"))))
            .end();
        return;
    }

    if (password.length < 5) {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'haslo' musi miec przynajmniej 5 znakow!")))
            .end();
        return;
    }

    if (password2 === undefined || password2 === "") {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError(("Pole 'powtorz haslo' nie moze byc puste!"))))
            .end();
        return;
    }

    if (password2.length < 5) {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'powtorz haslo' musi miec przynajmniej 5 znakow!")))
            .end();
        return;
    }

    if (password !== password2) {
        res
            .status(500)
            .send(JSON.stringify(ApiUtils.getError("Pole 'haslo' jest inne od pola 'powtorz haslo'")))
            .end();
        return;
    }

    let newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
    });

    User.createUser(newUser, function (err, user) {
        if (err) throw err;
        res.send(user).end()
    });
});

module.exports = router;