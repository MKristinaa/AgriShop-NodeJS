const Product = require('../models/product')

const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')


// Add new project
exports.newProduct = async (req, res, next) => {
    try {
        const result = await cloudinary.v2.uploader.upload(req.body.image, {
            folder: 'products',
            width: 150,
            crop: 'scale'
        });

        const { name, price, description,  category, user, stocks } = req.body;

        const product = await Product.create({
            name,
            price,
            description,
            category,
            user,
            stocks,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
    
};


// Get all products
exports.getProducts = async (req, res, next) => {
    try {
        const resPerPage = 2;
        const productCount = await Product.countDocuments();

        let apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter();

        let products = await apiFeatures.query;
        let filteredProductsCount = products.length;

        apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resPerPage);

        products = await apiFeatures.query;

        res.status(200).json({
            success: true,
            count: products.length,
            productCount,
            resPerPage,
            filteredProductsCount,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


//Get Single Product
exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product) {
        return res.status(404).json({
            success: false, 
            message: 'Producct not found'
        })
    }

    res.status(200).json({
        success: true,
        product
    })
}




// Update product => /api/v1/product/:id
exports.updateProduct = async (req, res, next) => {
    try {
        const newProductData = {
            name: req.body.name || "", 
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            stocks: req.body.stocks
        };

        if (req.body.image !== '') {
            const product = await Product.findById(req.params.id);
            
            if (!product) {
                return next(new ErrorHandler('Product not found', 404));
            }

            const image_id = product.image.public_id;
            await cloudinary.v2.uploader.destroy(image_id);

            const result = await cloudinary.v2.uploader.upload(req.body.image, {
                folder: 'products',
                width: 500,
                crop: "scale"
            });

            newProductData.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, newProductData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error:', JSON.stringify(error, null, 2)); 
        return next(error); 
    }
};





//Delete Product 
exports.deleteProduct = async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product) {
        return res.status(404).json({
            success: false, 
            message: 'Producct not found'
        })
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true, 
        message: 'Product is deleted'
    })
}


// Get products by user ID => /api/v1/products/user/:userId
exports.getProductByUserId = async (req, res, next) => {
        const userId = req.params.userId;

        // Pronađi sve proizvode koje je dodao korisnik sa zadatim userId
        const products = await Product.find({ user: userId });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found for this user'
            });
        }

        res.status(200).json({
            success: true,
            products
        });

};
