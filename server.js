// const app = require('./app')
// const connectDatabase = require('./config/database')
// const cloudinary = require('cloudinary')

// const dotenv = require('dotenv')

// dotenv.config({ path: 'config/config.env'})

// connectDatabase()


// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// app.listen(process.env.PORT, () => {
//     console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
// })

const app = require('./app'); 
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

// Učitaj environment varijable
dotenv.config({ path: 'config/config.env' });

// Poveži se sa bazom podataka
connectDatabase();

// Podesi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Pokreni server samo ako nije u test modu
if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.PORT, () => {
        console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
    });
}

module.exports = app;  
