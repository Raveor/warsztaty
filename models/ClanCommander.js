let mongoose = require('mongoose');

let ClanCommanderSchema = new mongoose.Schema({
    clanId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
});

mongoose.model('ClanCommander', ClanCommanderSchema);

module.exports = mongoose.model('ClanCommander');