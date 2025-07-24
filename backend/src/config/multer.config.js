const multer = require('multer');
const {
  UPLOAD_LIMITS,
  STORAGE_ERRORS,
  STORAGE_BUCKETS,
} = require('./storage.config');

const storage = multer.memoryStorage();

// Generic file filter factory
const createFileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`${STORAGE_ERRORS.INVALID_FILE_TYPE}: ${file.mimetype}`),
        false
      );
    }
  };
};

const multerConfigs = {
  teacherCredentials: {
    storage,
    fileFilter: createFileFilter(
      STORAGE_BUCKETS.TEACHER_CREDENTIALS.allowedMimeTypes
    ),
    limits: {
      fileSize: STORAGE_BUCKETS.TEACHER_CREDENTIALS.fileSizeLimit,
      files: 1,
    },
  },

  // Generic file upload (with max limits)
  generic: {
    storage,
    limits: {
      fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE,
      files: UPLOAD_LIMITS.MAX_FILES_PER_REQUEST,
    },
  },
};

// Create multer instances
const uploadInstances = {
  teacherCredentials: multer(multerConfigs.teacherCredentials),
  generic: multer(multerConfigs.generic),
};

module.exports = {
  multerConfigs,
  uploadInstances,
};
