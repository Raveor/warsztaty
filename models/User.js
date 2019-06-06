let mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String
    },
    adminFlag: {
        type: Boolean,
        default: false
    },
    contactFlag: {
        type: Boolean,
        default: true
    },
    activeFlag: {
        type: Boolean,
        default: true
    }});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');