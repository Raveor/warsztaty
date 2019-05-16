let mongoose = require('mongoose');

let CharacterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    level: {
        type: Number,
        required: true,
        default: 1
    },
    experience: { 
        type: Number,
        required: true,
        default: 0
    },
    statistics: {
        statPoints: {
            type: Number,
            required: true,
            default: 0
        },
        health: {
            type: Number,
            default: 1
        },
        strength: {
            type: Number,
            default: 1
        },
        agility: {
            type: Number,
            default: 1
        },
        intelligence: {
            type: Number,
            default: 1
        }
    },
    money: {
        type: Number,
        required: true,
        default: 0
    },
    currentHealth: {
        type: Number,
        required: true,
        default: 1
    }
});

mongoose.model('Character', CharacterSchema);

module.exports = mongoose.model('Character');