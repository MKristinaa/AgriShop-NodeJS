const express  = require('express');
const cors = require('cors');
const app  = express();
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(cors({
    origin: 'http://localhost:3000',  
    credentials: true 
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(fileUpload());


//Import all routes 
const products = require('./routes/product');
const user = require('./routes/user');
const order = require('./routes/order');

app.use('/api', products)
app.use('/api', user)
app.use('/api', order)

module.exports = app