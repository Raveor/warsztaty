let mongoose = require('mongoose');

let InventorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    itemId: {
        type: String,
        required: true
    },
    itemCategory: {
        type: String,
        required: true
    },
    equipped: {
        type: Boolean,
        required: true,
        default: false
    }
});
mongoose.model('Inventory', InventorySchema);

module.exports = mongoose.model('Inventory');