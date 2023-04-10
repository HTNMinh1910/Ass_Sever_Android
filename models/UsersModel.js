const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
    },
    name: {
        type: String,
    },
    pass: {
        type: String,
    },
    avatar: {
        type: String,
    }
})
module.exports = mongoose.model('users', usersSchema);
