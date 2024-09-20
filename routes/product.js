const express = require('express')
const router = express.Router();

const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/productController')


router.route('/products').get(getProducts);

router.route('/product/:id').get(getSingleProduct);

router.route('/product/new').post(newProduct);

router.route('/product/update/:id').put(updateProduct);

router.route('/product/delete/:id').delete(deleteProduct);


module.exports = router;