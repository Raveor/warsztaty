let mongoose = require('mongoose');

let WeaponSchema = new mongoose.Schema({
    weaponId: {
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
mongoose.model('Weapon', WeaponSchema);

module.exports = mongoose.model('Weapon');