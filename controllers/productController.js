const Product = require('../models/product')

const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')


exports.newProduct = async (req, res, next) => {
    try {
        const result = await cloudinary.v2.uploader.upload(req.body.image, {
            folder: 'products',
            width: 150,
            crop: 'scale'
        });

        const { name, price, description, ratings, category, user, stocks } = req.body;

        const product = await Product.create({
            name,
            price,
            description,
            ratings,
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
        console.error('Error:', JSON.stringify(error, null, 2)); // Detaljan ispis greške
        next(error);
    }
    
};


// Get all products
exports.getProducts = async (req, res, next) => {
    try {
        const resPerPage = 4;
        const productCount = await Product.countDocuments();

        // Kreiraj novi query objekat za pretragu i filtriranje
        let apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter();

        let products = await apiFeatures.query;
        let filteredProductsCount = products.length;

        // Kreiraj novi query objekat za paginaciju
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
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            ratings: req.body.ratings,
            stocks: req.body.stocks
        };

        // Ako postoji nova slika, ažuriraj sliku
        if (req.body.image !== '') {
            const product = await Product.findById(req.params.id);
            
            if (!product) {
                return next(new ErrorHandler('Product not found', 404));
            }

            // Brisanje stare slike sa Cloudinary-a
            const image_id = product.image.public_id;
            await cloudinary.v2.uploader.destroy(image_id);

            // Upload nove slike na Cloudinary
            const result = await cloudinary.v2.uploader.upload(req.body.image, {
                folder: 'products',
                width: 500,
                crop: "scale"
            });

            // Dodavanje nove slike u `newProductData`
            newProductData.images = [{
                public_id: result.public_id,
                url: result.secure_url
            }];
        }

        // Ako nema nove slike, zadrži postojeću sliku
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
        return next(error); // Prosljeđivanje greške middleware-u za rukovanje greškama
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
