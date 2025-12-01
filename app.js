const express  = require('express');
const cors = require('cors');
const app  = express();
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const morgan = require('morgan');
const logger = require('./config/logger');
const errorMiddleware = require('./middlewares/errorMiddleware');

// app.use(cors({
//     origin: 'https://agrishop-react.onrender.com',  
//     credentials: true 
// }));

const allowedOrigins = ['http://localhost:3000', 'https://agrishop-react.onrender.com'];

app.use(cors({
  origin: function(origin, callback){
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Dozvoli sve origene iz liste
      callback(null, true);
    } else {
      // Ako origin nije u listi, blokiraj ga
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
// app.use(fileUpload());


//Import all routes 
const products = require('./routes/product');
const user = require('./routes/user');
const order = require('./routes/order');

// Morgan HTTP log prosleđuje Winston-u
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


app.use('/api', products)
app.use('/api', user)
app.use('/api', order)


// Global error middleware NA KRAJU
app.use(errorMiddleware);

module.exports = app