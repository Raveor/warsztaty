let mongoose = require('mongoose');

let OutfitSchema = new mongoose.Schema({
    outfitId: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    defence: {
        type: Number,
        required: true
    },
    offence: {
        type: Number,
        required: true
    },
    bonus: {
        type: Number,
        required: true
    },
    minLevel: {
        type: Number,
        required: true
    }
});
mongoose.model('Outfit', OutfitSchema);

module.exports = mongoose.model('Outfit');