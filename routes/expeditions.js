'use strict';
const express = require('express');
const bodyParser = require('body-parser');
let ObjectId = require('mongodb').ObjectId;

const config = require('../config');

const ExpeditionModel = require('../models/Expedition');
const ExpeditionReportModel = require('../models/ExpeditionReport');
const ExpeditionsUtils = require('../scripts/ExpeditionsUtils');
const ApiUtils = require('../scripts/ApiUtils');

const TokenValidator = require('../scripts/TokenValidator');

const router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/available', TokenValidator, function (req, res, next) {
    ExpeditionModel.find({userId: req.userId}, function (err, expeditions) {
        if (err) {
            sendApiError(res, 500, "Couldn't download expeditions list: " + err.message);
            return;
        }

        let currentTimestamp = new Date().getTime();
        let expeditionsToDelete = Array();

        expeditions.forEach(function (e) {
            if (e.whenStarted !== undefined) {
                if ((e.whenStarted.getTime() + e.time) < currentTimestamp) {
                    expeditionsToDelete.push(e);
                }
            }
        });

        if (expeditionsToDelete.length > 0) {
            let listOfReports = Array();
            expeditionsToDelete.forEach(function (e) {
                listOfReports.push(ExpeditionsUtils.getReportFromExpedition(e));
            });

            ExpeditionReportModel
                .insertMany(listOfReports)
                .then(dep => {
                    let objectToDelete = expeditionsToDelete.map(value => ObjectId(value._id));

                    ExpeditionModel
                        .deleteMany(
                            {
                                _id: {$in: objectToDelete}
                            }, function (err) {
                                if (err) {
                                    sendApiError(res, 500, "Couldn't remove expeditions: " + err.message);
                                    return;
                                }

                                let newExpeditions = Array();
                                expeditionsToDelete.forEach(function (e) {
                                    newExpeditions.push(ExpeditionsUtils.getRandomExpedition(req.userId))
                                });

                                for (let i = expeditions.length + newExpeditions.length; i < config.userExpeditions; i++) {
                                    newExpeditions.push(ExpeditionsUtils.getRandomExpedition(req.userId))
                                }

                                ExpeditionModel
                                    .insertMany(newExpeditions)
                                    .then(dep => {
                                        ExpeditionModel.find({userId: req.userId}, function (err, e) {
                                            if (err) {
                                                sendApiError(res, 500, "Couldn't download expeditions list: " + err.message);
                                                return;
                                            }

                                            res.send(e);
                                        });
                                    })
                                    .catch(err => {
                                        sendApiError(res, 500, "Couldn't create new expeditions: " + err.message);
                                    })
                            })
                })
                .catch(err => {
                    sendApiError(res, 500, "Couldn't create reports from expeditions: " + err.message);
                })
        } else {
            if (expeditions.length === config.userExpeditions) {
                res.send(expeditions);
            } else {
                let listOfExpeditions = Array();
                for (let i = expeditions.length; i < config.userExpeditions; i++) {
                    listOfExpeditions.push(ExpeditionsUtils.getRandomExpedition(req.userId));
                }

                ExpeditionModel
                    .insertMany(listOfExpeditions)
                    .then(dep => {
                        ExpeditionModel.find({userId: req.userId}, function (err, e) {
                            if (err) {
                                sendApiError(res, 500, "Couldn't download expeditions list: " + err.message);
                                return;
                            }

                            res.send(e);
                        });
                    })
                    .catch(err => {
                        sendApiError(res, 500, "Couldn't create new expeditions: " + err.message);
                    })
            }
        }
    });
});

router.post('/go', TokenValidator, function (req, res, next) {
    let expeditionId = req.body.expeditionId;
    let userId = req.userId;

    if (expeditionId === undefined) {
        sendApiError(res, 500, "Field 'expeditionId' couldn't be empty.");
        return;
    }

    ExpeditionModel.find(
        {
            _id: ObjectId(expeditionId)
        },
        function (err, expeditions) {
            if (err) {
                sendApiError(res, 500, "Couldn't download expeditions list: " + err.message);
                return;
            }

            if (expeditions.length === 0) {
                sendApiError(res, 500, "Couldn't find expedition with id: " + expeditionId);
                return;
            }

            let expedition = expeditions[0];

            if (expedition.userId !== userId) {
                sendApiError(res, 500, "Expedition with id: " + expeditionId + " isn't available for user id: " + userId);
                return;
            }

            if (expedition.whenStarted !== undefined) {
                sendApiError(res, 500, "Expedition with id: " + expeditionId + " was already done or is in progress.");
                return;
            }

            let startedDate = new Date().getTime();
            ExpeditionModel.update(
                {_id: expedition._id},
                {whenStarted: startedDate},
                function (err, data) {
                    if (err) {
                        sendApiError(res, 500, "Couldn't start expedition with id: " + expeditionId);
                        return;
                    }

                    if (data.nModified !== 1) {
                        sendApiError(res, 500, "Couldn't start expedition with id: " + expeditionId);
                        return;
                    }

                    sendOkResult(res)
                });
        });
});

router.get('/reports', TokenValidator, function (req, res, next) {
    ExpeditionReportModel.find(
        {
            userId: req.userId
        },
        function (err, expeditionsReports) {
            if (err) {
                sendApiError(res, 500, "Couldn't download expeditions reports: " + err.message);
                return;
            }

            res.send(expeditionsReports);
        });
});

router.post('/reports/remove', TokenValidator, function (req, res, next) {

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