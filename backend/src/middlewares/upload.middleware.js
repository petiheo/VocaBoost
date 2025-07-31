const { uploadInstances } = require('../config/multer.config');
const { STORAGE_ERRORS } = require('../config/storage.config');
const ResponseUtils = require('../utils/response');
const ErrorHandler = require('../utils/errorHandler');

const handleMulterError = (err, req, res, next) => {
  if (err) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseUtils.error(res, STORAGE_ERRORS.FILE_TOO_LARGE, 400);
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return ResponseUtils.error(res, 'Too many files uploaded', 400);
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return ResponseUtils.error(res, `Unexpected field name. Expected: ${err.field}`, 400);
    }

    // Custom file type errors
    if (err.message && err.message.includes(STORAGE_ERRORS.INVALID_FILE_TYPE)) {
      return ResponseUtils.error(res, err.message, 400);
    }

    // Generic multer error
    if (err.name === 'MulterError') {
      return ResponseUtils.error(res, `Upload error: ${err.message}`, 400);
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
