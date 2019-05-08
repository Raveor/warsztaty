let mongoose = require('mongoose')

let CharacterSchema = new mongoose.Schema({
    _id: {
        type:Schema.Types.ObjectId,
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
    experienceRequired: {
        type: Number,
        required: true,
    },
    statPoints: {
        type: Number,
        required: true,
        default: 0
    },
    stats: {
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
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Character', CharacterSchema);

module.exports = mongoose.model('Character');