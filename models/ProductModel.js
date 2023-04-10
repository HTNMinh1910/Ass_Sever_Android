const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    color: {
        type: String,
    },
    img: {
        type: String,
    },
    type: {
        type: String,
    },
    username: {
        type: String,
    },
})
module.exports = mongoose.model('products', productsSchema);
