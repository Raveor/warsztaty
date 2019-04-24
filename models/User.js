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
    }
});
mongoose.model('users', UserSchema);

module.exports = mongoose.model('users');