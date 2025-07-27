const { uploadInstances } = require('../config/multer.config');
const { STORAGE_ERRORS } = require('../config/storage.config');

const handleMulterError = (err, req, res, next) => {
  if (err) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: STORAGE_ERRORS.FILE_TOO_LARGE,
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded',
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected field name. Expected: ${err.field}`,
      });
    }

    // Custom file type errors
    if (err.message && err.message.includes(STORAGE_ERRORS.INVALID_FILE_TYPE)) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Generic multer error
    if (err.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }
  }

  next(err);
};

// Middleware factories
const uploadMiddleware = {
  teacherCredentials: [
    uploadInstances.teacherCredentials.single('credentials'),
    handleMulterError,
  ],

  userAvatar: [uploadInstances.userAvatar.single('avatar'), handleMulterError],

  singleFile: (fieldName = 'file') => [
    uploadInstances.generic.single(fieldName),
    handleMulterError,
  ],

  multipleFiles: (fieldName = 'files', maxCount = 10) => [
    uploadInstances.generic.array(fieldName, maxCount),
    handleMulterError,
  ],

  // Upload files with different field names
  fields: (fields) => [uploadInstances.generic.fields(fields), handleMulterError],
};

module.exports = uploadMiddleware;
