const express = require('express');
const router = express.Router();

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
var Counter = require('../models/counter');

var config = require('../config');
var requireAuthenticated = require('../require-authenticated');

// Register
router.post('/register', (req, res, next) => {

    let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });

    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
        res.status(400).send({ success: false, msg: 'Ensure first name, last-name, email and password are provided' });
    } else if (req.body.password.length < 3 || req.body.password > 20) {
        res.status(400).send({ success: false, msg: 'Password should be between 3 and 20 characters' });
    } else {
        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (user)
                res.status(403).send({ success: false, msg: 'An user with this email already exists' });
            else if (!user) {
                User.createUser(newUser, (err, user) => {
                    if (err) {
                        if (err.errors.firstName)
                            res.status(403).json({ success: false, msg: err.errors.firstName.message });
                        else if (err.errors.lastName)
                            res.status(403).json({ success: false, msg: err.errors.lastName.message });
                        else if (err.errors.email)
                            res.status(403).json({ success: false, msg: err.errors.email.message });
                        else if (err.errors.password)
                            res.status(403).json({ success: false, msg: err.errors.password.message });
                    } else {
                        const payload = {
                            _id: user._id // acest obiect va fi criptat si trimis ca token
                        };
                        var token = jwt.sign(payload, config.secret, {  // config.secret este cheia secreta
                            expiresIn: 60 * 60 * 24 // expira in 24 ore
                        });

                        // returneaza informatia incluzand token-ul in JSON
                        res.json({
                            success: true,
                            message: 'User registred! Here is your token',
                            token: token
                        });
                    }
                });
                bcrypt.hash(newUser.password, null, null, function (err, hash) {
                    if (err) {
                        throw err;
                    }
                    newUser.password = hash;
                    User.update({ emal: req.body.email }, { password: hash}, function (err, user) {
                        if(err)
                            throw err;
                    });
                });
            }
        });
    }


});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    User.findOne({
        email: req.body.email
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
        } else if (user) {

            // parola este tinuta criptata in baza de date
            // pentru verificarea parolei, criptez parola introdusa si o compar cu cea din baza de date
            bcrypt.compare(req.body.password, user.password, function (err, match) {

                // verific daca cele doua parole coincid
                if (!match) {
                    res.status(403).send({ success: false, msg: 'Authentication failed. Wrong password.'});
                } else {

                    // daca userul exista si parola este corecta
                    // creaza un token in care este continut id-ul userului
                    const payload = {
                        _id: user._id
                    };

                    // cripteaza tokenul folosind cheia secreta din config.secret
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: 60 * 60 * 24 // expira in 24 ore
                    });

                    // returneaza tokenul ca JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }
            });
        }

    });
});

// Get by id
router.get('/:id(\\w{24})', (req, res, next) => {
    User.find({ _id: req.params.id }, function (err, user) {
        res.json(user);
    });
});

router.use(requireAuthenticated);

// Users
router.get('/', (req,res,next) => {
    User.find({}, function (err, users) {
        res.json(users);
    });
});

router.get('/me', (req, res) => {
    User.findOne({
        _id: req.decoded._id
    }, function (err, user) {
        res.json(user);
    });
});

// Update

router.put('/update', (req, res) => {
    if (req.body.telephone >= 100000000 && req.body.telephone<=999999999)
    {
        User.update({
            _id: req.decoded._id
        }, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                telephone: req.body.telephone
            }, function (err, user) {
                res.json(user);
            });
    }
    else{
        res.status(403).send({ success: false, message: 'Wrong phone number' });
    }
});


// delete

router.post('/delete', (req, res) => {
    User.findOne({
        _id: req.decoded._id
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.status(403).send({ success: false, message: 'Delete account failed. User not found.' });
        } else if (user) {

            bcrypt.compare(req.body.password, user.password, function (err, match) {

                // check if password matches
                if (!match) {
                    res.status(403).send({ success: false, message: 'Delete account failed. Wrong password.'});
                } else {
                    User.remove({ _id: user._id }, function (err) {
                        if (!err) {
                            res.json({
                                success: true,
                                message: 'Account deleted'
                            });
                        }
                        else {
                            res.status(403).send({ success: false, message: 'Could not delete user' });
                        }
                    });

                }
            });
        }
    });
});




module.exports = router;