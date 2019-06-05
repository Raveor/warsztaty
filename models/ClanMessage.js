let mongoose = require('mongoose');

let ClanMessageSchema = new mongoose.Schema({
    clanId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

mongoose.model('ClanMessage', ClanMessageSchema);

module.exports = mongoose.model('ClanMessage');