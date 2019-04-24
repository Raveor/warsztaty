let mongoose = require('mongoose');

let ExpeditionReportSchema = new mongoose.Schema({
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
    whenStarted: {
        type: Date,
        required: true
    },
    moneyPrize: {
        type: Number
    },
    itemPrize: {
        type: String
    }
});
mongoose.model('ExpeditionsReports', ExpeditionReportSchema);

module.exports = mongoose.model('ExpeditionsReports');