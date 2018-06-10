const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');

var Product = require('../models/product');
var Image = require('../models/image');

var requireAuthenticated = require('../require-authenticated');

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

// Get a product by id
router.get('/:id', (req, res, next) => {
    Product.find({ _id: req.params.id}, function (err, product) {
        res.json(product);
    });
});

router.use(requireAuthenticated);

// Create
router.post('/', (req, res, next) => {
    let newProduct = new Product({
        title: req.body.title,
        _ownerId: req.body._ownerId,
        category: req.body.category,
        description: req.body.description,
        quantity: req.body.quantity,
        available: req.body.available,
        price: req.body.price,
        pricePer: req.body.pricePer
    });
    Product.createProduct(newProduct, (err, product) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        }
        else {
            res.json(product);
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
        available: req.body.available,
        price: req.body.price,
        pricePer: req.body.pricePer,
        images: req.body.images
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

    form.uploadDir = 'uploads';
    form.keepExtensions = true;

    if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, 0744);
    }

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        } else {
            var newImage = new Image({
                name: files.file.name,
                path: files.file.path,
                type: files.file.type,
                size: files.file.size
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
    });
});

// Delete image
router.delete('/:productId/images/:imageId', (req, res) => {
    Product.findById(req.params.productId, (err, product) => {
        if (err) {
            res.status(403).json({ success: false, msg: err });
        } else {
            const image = product.images.id(req.params.imageId);
            fs.unlinkSync(image.path);
            if (err) {
                res.status(403).json({ success: false, msg: err });
            } else {
                product.images.pull(req.params.imageId);
                product.save((err, product) => {
                    if (err) {
                        res.status(403).json({ success: false, msg: err });
                    } else {
                        res.json(product);
                    }
                })
            }
        }
    })
});

module.exports = router;