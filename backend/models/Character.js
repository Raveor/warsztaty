let mongoose = require('mongoose')

let CharacterSchema = new mongoose.Schema({
    _id: {
        type:Schema.Types.ObjectId,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    experience: {
        type: Number,
        required: true,
        default: 0
    },
    level: {
        type: Number,
        required: true,
        default: 1
    },
    stats: {
        points: {
            type: Number,
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
        intelligentce: {
            type: Number,
            default: 1
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Character', CharacterSchema);

module.exports = mongoose.model('Character');