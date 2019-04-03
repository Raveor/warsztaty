let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
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
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');