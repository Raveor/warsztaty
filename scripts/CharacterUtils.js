const config = require('../config');

class Character {
    constructor(userId, level, experience, experienceRequired, statPoints, health, strength, agility, intelligence, currentHealth, money) {
        this.userId = userId;
        this.level = level;
        this.experience = experience;
        this.experienceRequired = experienceRequired;
        this.statPoints = statPoints;
        this.health = health;
        this.strength = strength;
        this.agility = agility;
        this.intelligence = intelligence;
        this.money = money;
        this.currentHealth = currentHealth;
    }
}

class Statistics {
    constructor(health, strength, agility, intelligence) {
        this.health = health;
        this.strength = strength;
        this.agility = agility;
        this.intelligence = intelligence;
    }
}
exports.calcExperienceRequired = function (level) {
    var constValue = 0.04;
    let experience = Math.pow(level, 2) / constValue
    return experience;
}

exports.levelUpCharacter = function (character) {
    character.level += 1;
    character.experience = 0 // is experience zero'ed with every levelup or cumulative?
    character.experienceRequired = calcExperienceRequired(character.level);
    character.statPoints += config.statPointsPerLevel;
    character.health += config.healthPointsPerLevel;

    return new Character(character.userId, character.level, character.experience, character.experienceRequired, character.statPoints, character.health, character.strength, character.agility, character.intelligence, character.money, character.currentHealth);
}

exports.saveStatistics = function (oldStats, newStats) { //need to pass old stats + modified stats

}

exports.createNewCharacter = function (userId) {
    let level = 1;
    let experience = 0;
    let experienceRequired = calcExperienceRequired(level);
    let statPoints = 0;
    let health = 5; // level 1 health value - temp
    let strength = 1;
    let agility = 1;
    let intelligence = 1;
    let money = 0;
    let currentHealth = health;

    return new Character(userId, level, experience, experienceRequired, statPoints, health, strength, agility, intelligence, money, currentHealth);
}
