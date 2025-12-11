const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cấu hình Cloudinary với API Key và Secret
const { CLOUNDINARY_CLOUND_NAME, CLOUNDINARY_API_KEY, CLOUNDINARY_API_SECRET } = process.env;
cloudinary.config({
  cloud_name: CLOUNDINARY_CLOUND_NAME, 
  api_key: CLOUNDINARY_API_KEY,        // Lấy từ Cloudinary Dashboard
  api_secret: CLOUNDINARY_API_SECRET,  // Lấy từ Cloudinary Dashboard
});

module.exports = cloudinary;