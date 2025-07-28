const { body, param, validationResult } = require('express-validator');
const supabase = require('../config/database');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({ success: false, errors: formattedErrors });
  }
  next();
};

const vocabularyValidator = {
  // --- LIST VALIDATORS ---
  createList: [
    body('title')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Title is required and must be between 2 and 100 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters.'),
    body('privacy_setting')
      .isIn(['private', 'public'])
      .withMessage("Privacy setting must be 'private' or 'public'."),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array of strings.')
      .custom(async (tags) => {
        if (tags.length === 0) return true;
        const { data, error, count } = await supabase.from('tags').select('name', { count: 'exact' }).in('name', tags);
        if (error) throw new Error('Server error during tag validation.');
        if (count !== tags.length) {
          const foundNames = data.map((t) => t.name);
          const invalidTags = tags.filter((name) => !foundNames.includes(name));
          throw new Error(`One or more tags are invalid. The tag '${invalidTags[0]}' does not exist.`);
        }
        return true;
      }),
    handleValidationErrors,
  ],

  updateList: [
    param('listId').isUUID().withMessage('URL parameter listId must be a valid UUID.'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters.'),
    handleValidationErrors,
  ],

  // --- WORD VALIDATORS ---
  createWord: [
    param('listId').isUUID().withMessage('URL parameter listId must be a valid UUID.'),
    body('term').trim().notEmpty().withMessage('Term is required.'),
    body('definition').trim().notEmpty().withMessage('Definition is required.'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL format.'),
    handleValidationErrors,
  ],

  createWordsBulk: [
    param('listId').isUUID().withMessage('URL parameter listId must be a valid UUID.'),
    body('words').isArray({ min: 1 }).withMessage('Words must be a non-empty array.'),
    body('words.*.term').notEmpty().withMessage('Each word must have a term.'),
    body('words.*.definition').notEmpty().withMessage('Each word must have a definition.'),
    handleValidationErrors,
  ],

  updateWord: [
    param('wordId').isUUID().withMessage('URL parameter wordId must be a valid UUID.'),
    body('term').optional().trim().notEmpty().withMessage('Term cannot be empty.'),
    body('definition').optional().trim().notEmpty().withMessage('Definition cannot be empty.'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL format.'),
    handleValidationErrors,
  ],

  addExample: [
    param('wordId').isUUID().withMessage('URL parameter wordId must be a valid UUID.'),
    body('exampleSentence')
      .trim()
      .isLength({ min: 10, max: 255 })
      .withMessage('Example sentence is required and must be between 2 and 255 characters.'),
    body('translation')
      .optional()
      .trim(),
    handleValidationErrors,
  ],

  addSynonyms: [
    param('wordId').isUUID().withMessage('URL parameter wordId must be a valid UUID.'),
    body('synonyms')
      .isArray({ min: 1 })
      .withMessage('Synonyms must be a non-empty array.'),
    // This checks that every item in the array is a non-empty string
    body('synonyms.*')
      .isString().withMessage('All items in the synonyms array must be strings.')
      .notEmpty().withMessage('Synonyms cannot be empty strings.'),
    handleValidationErrors,
  ],
};

module.exports = vocabularyValidator;