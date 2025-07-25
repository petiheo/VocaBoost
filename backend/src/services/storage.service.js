const logger = require('../utils/logger');
const {
  STORAGE_BUCKETS,
  STORAGE_ERRORS,
  URL_EXPIRATION,
} = require('../config/storage.config');
const storageHelpers = require('../helpers/storage.helper');
const { supabaseService } = require('../config/supabase.config');

class StorageService {
  constructor() {
    this.buckets = STORAGE_BUCKETS;
    this.initializeAllBuckets();
  }

  async initializeAllBuckets() {
    for (const [key, config] of Object.entries(this.buckets)) {
      await this.initializeBucket(config);
    }
  }

  async initializeBucket(bucketConfig) {
    try {
      const { data: buckets } = await supabaseService.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === bucketConfig.name);

      if (!bucketExists) {
        const { data, error } = await supabaseService.storage.createBucket(
          bucketConfig.name,
          {
            public: bucketConfig.public,
            allowedMimeTypes: bucketConfig.allowedMimeTypes,
            fileSizeLimit: bucketConfig.fileSizeLimit,
          }
        );

        if (error && error.code !== 'BucketAlreadyExists') {
          logger.error(`Error creating bucket ${bucketConfig.name}:`, error);
        } else {
          logger.info(`Storage bucket '${bucketConfig.name}' initialized`);
        }
      }
    } catch (error) {
      logger.error(`Init storage bucket ${bucketConfig.name} failed: `, error);
    }
  }

  // Generic upload method
  async uploadFile(file, options = {}) {
    const {
      bucketName,
      folder = '',
      fileName = null,
      allowOverwrite = false,
    } = options;

    try {
      const bucketConfig = Object.values(this.buckets).find(
        (b) => b.name === bucketName
      );
      if (!bucketConfig) throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND);

      // Generate file path
      let generatedFileName = fileName;
      if (!fileName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExt = storageHelpers.getFileExtension(file.originalname);
        generatedFileName = `${timestamp}-${randomString}${fileExt}`;
      }
      const filePath = folder ? `${folder}/${generatedFileName}` : generatedFileName;

      // Upload to Supabase Storage
      const { data, error } = await supabaseService.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: allowOverwrite,
        });
      if (error) throw error;

      let url;
      if (bucketConfig.public) {
        const { data: urlData } = await supabaseService.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        url = urlData.publicUrl;
      } else {
        // Generate signed URL for private buckets
        const { data: urlData } = await supabaseService.storage
          .from(bucketName)
          .createSignedUrl(data.path, URL_EXPIRATION.VERY_LONG);
        url = urlData.signedUrl;
      }

      return {
        path: data.path,
        url,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
        bucket: bucketName,
      };
    } catch (error) {
      logger.error('File upload failed: ', error);
      throw new Error(`${STORAGE_ERRORS.UPLOAD_FAILED}: ${error.message}`);
    }
  }

  // Specific upload methods for different use cases
  async uploadTeacherCredential(file, userId) {
    return this.uploadFile(file, {
      bucketName: this.buckets.TEACHER_CREDENTIALS.name,
      folder: userId,
    });
  }

  async uploadUserAvatar(file, userId) {
    const fileName = `${userId}-avatar${storageHelpers.getFileExtension(file.originalname)}`;
    return this.uploadFile(file, {
      bucketName: this.buckets.USER_AVATARS.name,
      fileName,
      allowOverwrite: true,
    });
  }
}

module.exports = new StorageService();
