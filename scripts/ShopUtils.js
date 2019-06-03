const config = require('../config');

class Weapon {
    constructor(weaponId, name, price, defence, offence, bonus, minLevel) {
        this.weaponId = weaponId;
        this.name = name;
        this.price = price;
        this.defence = defence;
        this.offence = offence;
        this.bonus = bonus;
        this.minLevel = minLevel;
    }
}

class Outfit {
    constructor(outfitId, category, name, price, defence, offence, bonus, minLevel) {
        this.outfitId = outfitId;
        this.category = category;
        this.name = name;
        this.price = price;
        this.defence = defence;
        this.offence = offence;
        this.bonus = bonus;
        this.minLevel = minLevel;
    }
}

const Weapons = [
    new Weapon(1, "medieval sword", 500, 1, 11, 0.1, 0),
    new Weapon(2, "medieval axe", 500, 1, 12, 0.1, 0),
    new Weapon(3, "medieval arch", 500, 1, 9, 0.1, 0),
    new Weapon(4, "medieval hammer", 500, 1, 10, 0.1, 0),
    new Weapon(5, "sword", 3000, 5, 33, 0.2, 5),
    new Weapon(6, "axe", 3000, 5, 31, 0.2, 5),
    new Weapon(7, "arch", 3000, 5, 35, 0.2, 5),
    new Weapon(8, "hammer", 3000, 5, 32, 0.2, 5),
];

const Outfits = [
    new Outfit(1, "A", "medieval armor", 500, 10, 0, 0.15, 0),
    new Outfit(2, "H", "medieval helmet", 150, 3, 0, 0.05, 0),
    new Outfit(3, "P", "medieval pants", 300, 4, 0, 0.06, 0),
    new Outfit(4, "S", "medieval shoes", 200, 2, 0, 0.03, 0),
    new Outfit(5, "A", "armor", 1500, 23, 0, 0.43, 0),
    new Outfit(6, "H", "helmet", 600, 9, 0, 0.9, 0),
    new Outfit(7, "P", "pants", 700, 8, 0, 0.8, 0),
    new Outfit(8, "S", "shoes", 500, 5, 0, 0.7, 0)
];

exports.getWeapons = function () {
    return Weapons
};

exports.getOutfits = function () {
    return Outfits
};