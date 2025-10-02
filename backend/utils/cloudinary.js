const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_COULD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Utility to Upload File (single or multiple)
const uploadOnCloudinary = async (file) => {
    if (!file || !file.buffer) return null;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'tailor-images',
                public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                width: 1000,
                height: 1000,
                crop: 'limit',
                quality: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error.message);
                    return reject(error);
                }
                resolve(result); // this includes public_id and secure_url
            }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream); // ✅ Correct stream
    });
};

module.exports = { uploadOnCloudinary };