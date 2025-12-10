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


router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);
router.route('/product/new').post(uploadProductImage, newProduct);
router.route('/product/update/:id').put(uploadProductImage, updateProduct);
router.route('/product/delete/:id').delete(deleteProduct);
router.route('/products/user/:userId').get(getProductByUserId);

module.exports = router;
