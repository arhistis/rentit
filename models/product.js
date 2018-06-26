var mongoose = require('mongoose');
var config = require('../config');
var Image = require('../models/image');
mongoose.connect(config.database);

var Schema = mongoose.Schema;

module.exports = mongoose.model('Product', new Schema({
    title: {
        type: String,
        required: true
    },
    _ownerId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Tools', 'Equipments', 'Sports', 'Furniture', 'Automobiles', 'Apartments']
    },
    description: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    pricePer: {
        type: String,
        required: true,
        enum: ['Hour', 'Day', 'Week', 'Month']
    },
    images: [Image.schema],
    rating: {
        type: Number,
        required: true
    }
}));

module.exports.createProduct = function (newProduct, callback) {
    newProduct.save(callback);
}
