import multer from 'multer';

// Use memory storage to store files as buffers before uploading to Cloudinary
const storage = multer.memoryStorage();

// Filter files to allow only images and videos
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only images are allowed for profile image!'), false);
        }
    } else if (file.fieldname === 'introVideo') {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only videos are allowed for intro video!'), false);
        }
    } else {
        cb(new Error('Unknown field!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});

export default upload;
