let mongoose = require('mongoose');

let ExpeditionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    whenCreated: {
        type: Date,
        required: true
    },
    whenStarted: {
        type: Date
    }
});
mongoose.model('Expedition', ExpeditionSchema);

module.exports = mongoose.model('Expedition');