const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Please name can not exceed 100 characters'] 
    },
    price: {
        type: Number,
        required : [true, 'Please enter product price'],
        maxLength: [5, 'Please price can not exceed 5 characters'] ,
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    
    image: {
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    category: {
        type: String,
        required: [true, 'Please enter category for this product'],
        enum: {
            values: [
                'Vegetables',
                'Fruits',
                'Grains',
                'Dairy Products',
                'Meat & Poultry',
                'Honey & Beekeeping Products',
                'Herbs & Spices',
                'Nuts & Seeds',
                'Beverages',
                'Others'
            ],
            message: 'Please select correct category for products'
        }
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    stocks: {
        type: Number,
        required: [true, 'Please enter stock quantity'],
        default: 0
    }
}, { timestamps: true }) 

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
