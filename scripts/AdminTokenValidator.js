const jwt = require('jsonwebtoken');
const ApiUtils = require('./ApiUtils');
const config = require('../config');

function verifyAdminToken(req, res, next) {
    let token = req.headers['x-access-token'];
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

        if (decoded.isAdmin === false) {
            res
                .status(401)
                .send(ApiUtils.getApiError("Nie posiadasz uprawnien administracyjnych"));
            return;
        }

        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyAdminToken;