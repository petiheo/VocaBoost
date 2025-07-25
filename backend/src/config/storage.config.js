// Storage bucket configurations
const STORAGE_BUCKETS = {
  TEACHER_CREDENTIALS: {
    name: 'teacher-credentials',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    description: 'Teacher verification documents',
  },

  USER_AVATARS: {
    name: 'user-avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp',
    ],
    description: 'User profile pictures',
  },
};

// File upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_REQUEST: 10,
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// Storage paths configuration
const STORAGE_PATHS = {
  TEACHER_CREDENTIALS: {
    pattern: '{userId}/{timestamp}-{random}.{ext}',
    example: '123e4567-e89b/1627890123456-abc123.pdf',
  },
};

// URL expiration times (in seconds)
const URL_EXPIRATION = {
  DEFAULT: 3600, // 1 hour
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
  VERY_LONG: 31536000, // 1 year
};

// Error messages
const STORAGE_ERRORS = {
  INVALID_FILE: 'Invalid file data',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE: 'File type is not allowed',
  BUCKET_NOT_FOUND: 'Storage bucket not found',
  UPLOAD_FAILED: 'Failed to upload file',
  DELETE_FAILED: 'Failed to delete file',
  ACCESS_DENIED: 'Access denied to this file',
  FILE_NOT_FOUND: 'File not found',
};

module.exports = {
  STORAGE_BUCKETS,
  UPLOAD_LIMITS,
  STORAGE_PATHS,
  URL_EXPIRATION,
  STORAGE_ERRORS,
};
