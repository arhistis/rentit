var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var config = require('../config');
mongoose.connect(config.database);

var Schema = mongoose.Schema;

var OrderSchema = mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    _rentorId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    _clientId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    zip: {
        type: Number,
        required: true
    },
    _productId: {
        type: Schema.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        requires: true
    },
    fromDateYear: {
        type: Number,
        required: true
    },
    fromDateMonth: {
        type: Number,
        required: true
    },
    fromDateDay: {
        type: Number,
        required: true
    },
    fromDateHour: {
        type: Number,
        required: true
    },
    fromDateMinute: {
        type: Number,
        required: true
    },
    toDateYear: {
        type: Number,
        required: true
    },
    toDateMonth: {
        type: Number,
        required: true
    },
    toDateDay: {
        type: Number,
        required: true
    },
    toDateHour: {
        type: Number,
        required: true
    },
    toDateMinute: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['started', 'ended', 'reserved', 'canceled']
    }
});

OrderSchema.plugin(autoIncrement.plugin, {
    model: 'Order',
    field: 'id',
    startAt: 1
});
// var Order = connection.model('Order', OrderSchema);

module.exports = mongoose.model('Order', OrderSchema);

module.exports.createOrder = function (newOrder, callback) {

    // mongoose.model('Counter').find({_id: newOrder._rentorId}).then(function(counter){
    //     console.log(counter.count);
    // });
    newOrder.save(callback);
}
