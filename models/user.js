// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var config = require('../config');
mongoose.connect(config.database);

var Schema = mongoose.Schema;

var firstNameValidator = [
    validate({
        validator: 'isLength',
        arguments: [2, 20],
        message: 'First name should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z]{2,20}$/,
        message: 'Must contain only letters'
    })
]

var lastNameValidator = [
    validate({
        validator: 'isLength',
        arguments: [2, 20],
        message: 'Last mame should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z]{2,20}$/,
        message: 'Must contain only letters'
    })
]

var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'It is not a valid email'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 40],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
]

var phoneValidator = [
    validate({
        validator: 'matches',
        argument: /^\d{10}$/,
        message: 'Phone number must contain 10 digits'
    })
]


// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    firstName: {
        type: String,
        required: true,
        validate: firstNameValidator
    },
    lastName: {
        type: String,
        required: true,
        validate: lastNameValidator
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        validate: emailValidator
    },
    telephone: {
        type: Number,
        required: false,
        validate: phoneValidator
    },
    password: {
        type: String,
        required: true
    },
    admin: Boolean,
    products: [{
        type: Schema.ObjectId,
        ref: 'Product'
    }]
}));

module.exports.getUserById = function (id, callback){
    User.findById(id, callback);
}

module.exports.createUser = function (newUser, callback) {
    newUser.save(callback);
}