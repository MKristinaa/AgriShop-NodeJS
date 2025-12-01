const Product = require('../models/product');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary')
const multer = require('multer');
const streamifier = require('streamifier');

// Multer storage - koristi memory storage za direktan upload na Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware za upload fajla (jedan fajl, polje "image")
exports.uploadProductImage = upload.single('image');

// Add new product
exports.newProduct = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }

        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { folder: 'products' },
            async (error, result) => {
                if (error) return next(error);

                const { name, price, description, category, user, stocks } = req.body;

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
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        next(error);
    }
};

// Get all products
exports.getProducts = async (req, res, next) => {
    try {
        const resPerPage = 8;
        const productCount = await Product.countDocuments();

        // 1. Prvo query sa search i filter
        let apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter();

        // 2. Dodaj sortiranje po poslednje dodatim
        apiFeatures.query = apiFeatures.query.sort({ createdAt: -1 });

        let products = await apiFeatures.query;
        let filteredProductsCount = products.length;

        // 3. Pagination takođe mora da koristi sortirani query
        apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resPerPage);

        apiFeatures.query = apiFeatures.query.sort({ createdAt: -1 }); // opet sort

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

// Get single product
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// Update product
exports.updateProduct = async (req, res, next) => {
    try {
        const newProductData = {
            name: req.body.name || "",
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            stocks: req.body.stocks
        };

        if (req.file) {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return next({ message: 'Product not found', statusCode: 404 });
            }

            // Briše staru sliku
            await cloudinary.v2.uploader.destroy(product.image.public_id);

            // Upload nove slike
            const uploadStream = cloudinary.v2.uploader.upload_stream(
                { folder: 'products' },
                async (error, result) => {
                    if (error) return next(error);

                    newProductData.image = {
                        public_id: result.public_id,
                        url: result.secure_url
                    };

                    const updatedProduct = await Product.findByIdAndUpdate(
                        req.params.id,
                        newProductData,
                        { new: true, runValidators: true, useFindAndModify: false }
                    );

                    res.status(200).json({
                        success: true,
                        product: updatedProduct
                    });
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        } else {
            // Ako nema nove slike, update samo ostala polja
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                newProductData,
                { new: true, runValidators: true, useFindAndModify: false }
            );

            res.status(200).json({
                success: true,
                product: updatedProduct
            });
        }
    } catch (error) {
        next(error);
    }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Briše sliku sa Cloudinary
        await cloudinary.v2.uploader.destroy(product.image.public_id);

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product is deleted'
        });
    } catch (error) {
        next(error);
    }
};

// Get products by user ID
exports.getProductByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        // Pronađi proizvode ovog korisnika i sortiraj po createdAt opadajuće
        const products = await Product.find({ user: userId }).sort({ createdAt: -1 });

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
    } catch (error) {
        next(error);
    }
};
