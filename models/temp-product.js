var mongoose = require('mongoose');
var config = require('../config');
var Image = require('../models/image');
mongoose.connect(config.database);

var Schema = mongoose.Schema;

module.exports = mongoose.model('TempProduct', new Schema({
    _ownerId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    images: [Image.schema]
}));

module.exports.createProduct = function (newProduct, callback) {
    newProduct.save(callback);
}
