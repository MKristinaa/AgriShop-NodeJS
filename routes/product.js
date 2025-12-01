const express = require('express');
const router = express.Router();

const { 
    uploadProductImage,  // dodato
    getProducts, 
    newProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProduct, 
    getProductByUserId 
} = require('../controllers/productController');

// Get all products
router.route('/products').get(getProducts);

// Get single product
router.route('/product/:id').get(getSingleProduct);

// Add new product (sada koristi upload middleware)
router.route('/product/new').post(uploadProductImage, newProduct);

// Update product (sada koristi upload middleware)
router.route('/product/update/:id').put(uploadProductImage, updateProduct);

// Delete product
router.route('/product/delete/:id').delete(deleteProduct);

// Get products by user
router.route('/products/user/:userId').get(getProductByUserId);

module.exports = router;
