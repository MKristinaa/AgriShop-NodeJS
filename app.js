const express  = require('express');
const cors = require('cors');
const app  = express();
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('./config/logger');
const errorMiddleware = require('./middlewares/errorMiddleware');


const allowedOrigins = ['http://localhost:3000', 'https://agrishop-react.onrender.com'];

app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


app.use(cookieParser());

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


const products = require('./routes/product');
const user = require('./routes/user');
const order = require('./routes/order');


app.use('/api', products);
app.use('/api', user);
app.use('/api', order);


app.use(errorMiddleware);

module.exports = app;
