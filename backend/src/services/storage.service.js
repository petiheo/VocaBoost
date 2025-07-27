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

  _validateBucketConfig(bucketName) {
    const bucketConfig = Object.values(this.buckets).find(
      (b) => b.name === bucketName
    );
    if (!bucketConfig) throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND);
    return bucketConfig;
  }

  _generateFilePath(file, fileName, folder) {
    let generatedFileName = fileName;
    if (!fileName) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = storageHelpers.getFileExtension(file.originalname);
      generatedFileName = `${timestamp}-${randomString}${fileExt}`;
    }
    return folder ? `${folder}/${generatedFileName}` : generatedFileName;
  }

  async _performUpload(bucketName, filePath, file, allowOverwrite) {
    const { data, error } = await supabaseService.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: allowOverwrite,
      });
    if (error) throw error;
    return data;
  }

  async _generateFileUrl(bucketConfig, bucketName, filePath) {
    if (bucketConfig.public) {
      const { data: urlData } = await supabaseService.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return urlData.publicUrl;
    } else {
      const { data: urlData } = await supabaseService.storage
        .from(bucketName)
        .createSignedUrl(filePath, URL_EXPIRATION.VERY_LONG);
      return urlData.signedUrl;
    }
  }

  _buildUploadResult(uploadData, file, bucketName, url) {
    return {
      path: uploadData.path,
      url,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname,
      bucket: bucketName,
    };
  }

  async uploadFile(file, options = {}) {
    const {
      bucketName,
      folder = '',
      fileName = null,
      allowOverwrite = false,
    } = options;

    try {
      const bucketConfig = this._validateBucketConfig(bucketName);
      const filePath = this._generateFilePath(file, fileName, folder);
      const uploadData = await this._performUpload(
        bucketName,
        filePath,
        file,
        allowOverwrite
      );
      const url = await this._generateFileUrl(
        bucketConfig,
        bucketName,
        uploadData.path
      );

      return this._buildUploadResult(uploadData, file, bucketName, url);
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
