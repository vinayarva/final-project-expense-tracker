const multer = require('multer');
const path = require('path');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Initialize multer with memory storage and fileFilter
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Error: File type not allowed!'));
    }
});

// Middleware for handling file upload in memory as buffer
const uploadFile = (req, res, next) => {
    upload.single('fileInputName')(req, res, (err) => { // This must match your input name
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = uploadFile;
