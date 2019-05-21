const config = require('../config');

class Expedition {
    constructor(userId, name, level, time, createdDate) {
        this.userId = userId;
        this.name = name;
        this.whenCreated = createdDate;
        this.level = level;
        this.time = time;
    }
}

class ExpeditionReport {
    constructor(userId, name, level, time, whenStarted, moneyPrize) {
        this.userId = userId;
        this.name = name;
        this.whenStarted = whenStarted;
        this.level = level;
        this.time = time;
        this.moneyPrize = moneyPrize;
    }
}

const expeditionNames1 = ["Dark", "Far", "Old", "Forgotten", "Frightening"];
const expeditionNames2 = ["Forest", "Castle", "Square", "Town", "Dungeon"];

exports.getRandomExpedition = function (userId) {
    let randomName1 = expeditionNames1[Math.floor(Math.random() * expeditionNames1.length)];
    let randomName2 = expeditionNames2[Math.floor(Math.random() * expeditionNames2.length)];

    let expeditionName = randomName1 + " " + randomName2;
    let expeditionCreatedTime = new Date().getTime();
    let expeditionLevel = 1;
    let expeditionTime = Math.floor(Math.random() * (config.expeditionMaxTime - config.expeditionMinTime + 1)) + config.expeditionMinTime;

    return new Expedition(userId, expeditionName, expeditionLevel, expeditionTime, expeditionCreatedTime)
};

exports.getReportFromExpedition = function (expedition) {
    return new ExpeditionReport(expedition.userId, expedition.name, expedition.level, expedition.time, expedition.whenStarted, expedition.moneyPrize)
};

