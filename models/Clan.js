let mongoose = require('mongoose');

let ClanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    money: {
        type: Number,
        required: true,
        default: 0
    },
    rank: {
        type: Number,
        required: true,
        default: 5
    },
    buildings: {
        church: {
            type: Number,
            required: true,
            default: 1
        },
        castle: {
            type: Number,
            required: true,
            default: 1
        },
        wall: {
            type: Number,
            required: true,
            default: 1
        },
        arsenal: {
            type: Number,
            required: true,
            default: 1
        },
        storage: {
            type: Number,
            required: true,
            default: 1
        },
    }
});

mongoose.model('Clan', ClanSchema);

module.exports = mongoose.model('Clan');