const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cấu hình Cloudinary với API Key và Secret
cloudinary.config({
  cloud_name: 'drq4dhz2t', 
  api_key: '992523216696428',        // Lấy từ Cloudinary Dashboard
  api_secret: 'bR4LQkW9zF8yS8LVZ-OjLDEQwKw',  // Lấy từ Cloudinary Dashboard
});

module.exports = cloudinary;