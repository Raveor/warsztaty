const config = require('../config');

class Character {
    constructor(userId, level, experience, experienceRequired, statPoints, statistics, money, currentHealth) {
        this.userId = userId;
        this.level = level;
        this.experience = experience;
        this.experienceRequired = experienceRequired;
        this.statPoints = statPoints;
        this.statistics = statistics;
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
    let experience = Math.pow(level, 2) / 0.04;
    return experience;
};

exports.levelUpCharacter = function (character) {
    character.level += 1;
    character.experience = character.experience - character.experienceRequired;
    character.experienceRequired = calcExperienceRequired(character.level);
    character.statPoints += config.statPointsPerLevel;
    
    let statistics = character.statistics;
    let health = statistics.health + config.healthPointsPerLevel;
    let newStatistics = new Statistics(health, statistics.strength, statistics.agility, statistics.intelligence);

    return new Character(character.userId, character.level, character.experience, character.experienceRequired, character.statPoints, newStatistics, character.money, health);
};

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

    let statistics = new Statistics(health, strength, agility, intelligence);

    return new Character(userId, level, experience, experienceRequired, statPoints, statistics, money, currentHealth);
};

exports.validateStatistics = function (character, updatedCharacter) { 
    let statPointsDiff = updatedCharacter.statPoints - character.statPoints;
    if (statPointsDiff > 0) { 
        console.log('statPointsDiff < 0');
        return false;
    }
    
    let stats = character.statistics;
    let updatedStats = updatedCharacter.statistics;
    
    if (updatedStats.health < stats.health || updatedStats.strength < stats.strength
         || updatedStats.agility < stats.agility || updatedStats.intelligence < stats.intelligence) {
        console.log('at least one of statistics lower than before');
        
        return false;
    }

    let statsTotal = stats.health + stats.strength + stats.agility + stats.intelligence;
    let updatedStatTotals = updatedStats.health + updatedStats.strength + updatedStats.agility + updatedStats.intelligence;
    let statDiff = statsTotal - updatedStatTotals;

    if (statPointsDiff !== statDiff) {
        console.log('statPointsDiff != statDiff');
        
        return false;
    }

    return true;
};
