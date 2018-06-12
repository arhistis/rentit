var mongoose = require('mongoose');
var config = require('../config');
mongoose.connect(config.database);

var Schema = mongoose.Schema;

module.exports = mongoose.model('Image', new Schema({
    url: {
        type: String,
        required: true
    },
}));

module.exports.createImage = function (newImage, callback) {
    newImage.save(callback);
}
