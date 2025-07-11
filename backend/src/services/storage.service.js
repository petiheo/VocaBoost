const supabase = require('../config/database');
const VOCABULARY_BUCKET = 'word_images';

class StorageService {
  /**
   * Uploads a file to Supabase Storage.
   * @param {object} file - The file object from multer (req.file).
   * @param {string} userId - The ID of the user uploading the file.
   * @returns {Promise<string>} The public URL of the uploaded file.
   */
  async uploadWordImage(file, userId) {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    const fileBuffer = file.buffer;
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;
    const fileOptions = {
      contentType: file.mimetype,
      cacheControl: '3600', // Cache for 1 hour
      upsert: false,
    };

    // Upload the file to the 'word_images' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(VOCABULARY_BUCKET)
      .upload(fileName, fileBuffer, fileOptions);

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload image to storage.');
    }

    // Get the public URL for the newly uploaded file
    const { data: urlData } = supabase.storage
      .from(VOCABULARY_BUCKET)
      .getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to retrieve public URL for the image.');
    }

    return urlData.publicUrl;
  }
}

module.exports = new StorageService();
