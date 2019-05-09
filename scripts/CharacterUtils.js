const config = require('../config');

class Character {
    constructor(userId, level, experience, experienceRequired, statPoints, statistics, health, strength, agility, intelligence, currentHealth, money) {
        this.userId = userId;
        this.level = level;
        this.experience = experience;
        this.experienceRequired = experienceRequired;
        this.statPoints = statPoints;
        
        this.statistics = statistics
        
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

let calcExperienceRequired = function (level) {
    var constValue = 0.04;
    let experience = Math.pow(level, 2) / constValue
    return experience;
}

exports.levelUpCharacter = function (character) {
    character.level += 1;
    character.experience = 0 // experience zero'ed with every levelup
    character.experienceRequired = calcExperienceRequired(character.level);
    character.statPoints += config.statPointsPerLevel;
    let statistics = character.statistics;
    let health = statistics.health + config.healthPointsPerLevel;

    character.currentHealth = character.health;

    let newStatistics = new Statistics(health, statistics.strength, statistics.agility, statistics.intelligence)

    return new Character(character.userId, character.level, character.experience, character.experienceRequired, character.statPoints, newStatistics, character.money, character.currentHealth);
}

exports.createNewCharacter = function (userId) {
    let level = 1;
    let experience = 0;
    let experienceRequired = calcExperienceRequired(level);
    let statPoints = 0;
    let health = 5; // level 1 health value for now
    let strength = 1;
    let agility = 1;
    let intelligence = 1;
    let money = 0;
    let currentHealth = health;

    let statistics = new Statistics(health, strength, agility, intelligence)

    return new Character(userId, level, experience, experienceRequired, statPoints, statistics, money, currentHealth);
}
