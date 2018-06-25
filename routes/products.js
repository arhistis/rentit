const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const cloudinary = require('cloudinary');
const argv = require('yargs').argv;

var Product = require('../models/product');
var TempProduct = require('../models/temp-product');
var Image = require('../models/image');

var requireAuthenticated = require('../require-authenticated');

var configFile = argv.config ? '../config.' + argv.config : '../config';
var config = require(configFile); // get our config file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || config.cloudinary_cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || config.cloudinary_api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || config.cloudinary_api_secret,
})

// Get all products
router.get('/', (req, res, next) => {
    Product.find({}, function (err, products) {
        res.json(products);
    });
});

// Get all products of an user
router.get('/owner:id', (req, res, next) => {
    Product.find({_ownerId: req.params.id}, function (err, products) {
        res.json(products);
    });
});

// Get all products by category name
router.get('/category:category', (req, res, next) => {
    Product.find({category: req.params.category}, function (err, products) {
        res.json(products);
    });
});

// Get a product by id
router.get('/:id', (req, res, next) => {
    Product.find({ _id: req.params.id}, function (err, product) {
        res.json(product);
    });
});

router.use(requireAuthenticated);

// Create
router.post('/', (req, res, next) => {
    TempProduct.findById(req.body.tempId, (err, tempProduct) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        } else {
            let newProduct = new Product({
                title: req.body.title,
                _ownerId: req.body._ownerId,
                category: req.body.category,
                description: req.body.description,
                quantity: req.body.quantity,
                price: req.body.price,
                pricePer: req.body.pricePer,
                images: tempProduct.images
            });
            Product.createProduct(newProduct, (err, product) => {
                if (err) {
                    res.status(403).json({ success: false, msg: err });
                }
                else {
                    tempProduct.remove();
                    res.json(product);
                }
            });
        }
    });
});

// Update
router.put('/update/:id', (req, res, next) => {
    Product.update({_id: req.params.id}, {
        title: req.body.title,
        _ownerId: req.body._ownerId,
        category: req.body.category,
        description: req.body.description,
        quantity: req.body.quantity,
        price: req.body.price,
        pricePer: req.body.pricePer,
        // images: req.body.images
    }, (err, product) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        }
        else {
            res.json(product);
        }
    });
});


// Delete
router.post('/delete', (req, res) => {
    Product.remove({ _id: req.body._id }, function (err) {
        if (!err) {
            res.json({
                success: true,
                message: 'Product deleted'
            });
        }
        else {
            res.status(403).send({ success: false, message: 'Could not delete product' });
        }
    });
});

// Upload image
router.post('/:productId/images', (req, res) => {
    const form = new formidable.IncomingForm();

    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        } else {

            cloudinary.uploader.upload(files.file.path, (resp) => {
                if (resp.error) {
                    res.status(403).json({ success: false, msg: 'Failed to upload image to cloudinary.' });
                } else {
                    var newImage = new Image({
                        url: resp.url,
                    });

                    Product.findByIdAndUpdate(req.params.productId, {
                        $push: { images: newImage }
                    }, { 'new': true }, (err, product) => {
                        if (err) {
                            res.status(403).json({ success: false, msg: err });
                        }
                        else {
                            res.json(product);
                        }
                    });
                }
            }, { width: 400, height: 400, crop: "fill" });
        }
    });
});

// Delete image
router.delete('/:productId/images/:imageId', (req, res) => {
    Product.findByIdAndUpdate(req.params.productId, {
        $pull: { images: { _id: req.params.imageId} }
    }, { 'new': true }, (err, product) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        }
        else {
            res.json(product);
        }
    });
});

// Create temp
router.post('/temp', (req, res, next) => {
    let newProduct = new TempProduct({
        _ownerId: req.body._ownerId,
    });
    TempProduct.createProduct(newProduct, (err, tempProduct) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        }
        else {
            res.json(tempProduct);
        }
    });
});

// Upload temp image
router.post('/temp/:tempProductId/images', (req, res) => {
    const form = new formidable.IncomingForm();

    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        } else {
            cloudinary.uploader.upload(files.file.path, (resp) => {
                if (resp.error) {
                    res.status(403).json({ success: false, msg: 'Failed to upload image to cloudinary.' });
                } else {
                    var newImage = new Image({
                        url: resp.url,
                    });

                    TempProduct.findByIdAndUpdate(req.params.tempProductId, {
                        $push: { images: newImage }
                    }, { 'new': true }, (err, tempProduct) => {
                        if (err) {
                            res.status(403).json({ success: false, msg: err });
                        }
                        else {
                            res.json(tempProduct);
                        }
                    });
                }
            }, { width: 400, height: 400, crop: "fill" });
        }
    });
});

// Delete image
router.delete('/temp/:tempProductId/images/:imageId', (req, res) => {
    TempProduct.findByIdAndUpdate(req.params.tempProductId, {
        $pull: { images: { _id: req.params.imageId } }
    }, { 'new': true }, (err, tempProduct) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        }
        else {
            res.json(tempProduct);
        }
    });
});

module.exports = router;