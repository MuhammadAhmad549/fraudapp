const multer = require('multer');
const path = require('path');

// Setup storage for multer (in case you want to temporarily store images before uploading to Cloudinary)
const storage = multer.memoryStorage();


// Middleware to handle single image upload
const uploadSingle = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Max file size: 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('image'); // Field name for single image upload


// Middleware to handle multiple image uploads
const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Max file size: 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).array('images', 5);  // Field name for multiple images and max 5 images



const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const useMulterFields = (fields) =>
    multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    }).fields(fields);

module.exports = { uploadSingle, uploadMultiple, useMulterFields };