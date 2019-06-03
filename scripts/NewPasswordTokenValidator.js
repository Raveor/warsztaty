const jwt = require('jsonwebtoken');
const ApiUtils = require('./ApiUtils');
const config = require('../config');

function verifyToken(req, res, next) {
    let token = req.query.token;
    if (!token) {
        res
            .status(403)
            .send(ApiUtils.getApiError("Nie podano tokenu"));
        return;
    }
    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            res
                .status(500)
                .send(ApiUtils.getApiError("Nie udalo sie zweryfikowac tokenu: " + err.message));
            return;
        }

        if (decoded.canSetNewPassword === false) {
            res
                .status(401)
                .send(ApiUtils.getApiError("Ten token nie daje uprawnien do zmiany hasla"));
            return;
        }
        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;