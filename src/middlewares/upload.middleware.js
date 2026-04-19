import multer from 'multer';
import Response from '../utils/response.js';

// Use memory storage to avoid writing files to disk before uploading to Bunny
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
    return cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware to handle single file upload and catch errors
 * @param {string} fieldName - The name of the file field in the request
 */
const singleFileUpload = (fieldName) => (req, res, next) => {
  const uploadHandler = upload.single(fieldName);
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(Response.error('File size too large. Maximum limit is 5MB.', 400));
      }
      return res.status(400).json(Response.error(`Upload error: ${err.message}`, 400));
    } else if (err) {
      return res.status(400).json(Response.error(err.message, 400));
    }
    next();
  });
};

export default {
  singleFileUpload,
};
