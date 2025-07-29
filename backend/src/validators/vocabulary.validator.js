const { body, param, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase.config');
const { handleValidationErrors } = require('./common.validator');

const vocabularyValidator = {
  // =================================================================
  //  LIST VALIDATORS
  // =================================================================
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
        const { data, error, count } = await supabase
          .from('tags')
          .select('name', { count: 'exact' })
          .in('name', tags);
        if (error) throw new Error('Server error during tag validation.');
        if (count !== tags.length) {
          const foundNames = data.map((t) => t.name);
          const invalidTags = tags.filter((name) => !foundNames.includes(name));
          throw new Error(
            `One or more tags are invalid. The tag '${invalidTags[0]}' does not exist.`
          );
        }
        return true;
      }),
    handleValidationErrors,
  ],

  updateList: [
    param('listId')
      .isUUID()
      .withMessage('URL parameter listId must be a valid UUID.'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Title must be between 2 and 100 characters.'),
    // Note: You might want to add back the other fields like description, privacy_setting, and tags as optional checks here.
    handleValidationErrors,
  ],

  // =================================================================
  //  WORD VALIDATORS
  // =================================================================
  createWord: [
    param('listId')
      .isUUID()
      .withMessage('URL parameter listId must be a valid UUID.'),
    body('term').trim().notEmpty().withMessage('Term is required.'),
    body('definition').trim().notEmpty().withMessage('Definition is required.'),
    body('translation').optional().trim().isString(),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Image URL must be a valid URL format.'),
    body('exampleSentence')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Example sentence must be between 2 and 255 characters.'),
    body('synonyms')
      .optional()
      .isArray()
      .withMessage('Synonyms must be an array of strings.'),
    body('synonyms.*')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Synonyms cannot be empty strings.'),
    handleValidationErrors,
  ],

  createWordsBulk: [
    param('listId')
      .isUUID()
      .withMessage('URL parameter listId must be a valid UUID.'),
    body('words')
      .isArray({ min: 1 })
      .withMessage('Words must be a non-empty array.'),
    body('words.*.term').notEmpty().withMessage('Each word must have a term.'),
    body('words.*.definition')
      .notEmpty()
      .withMessage('Each word must have a definition.'),
    body('words.*.translation').optional().isString(),
    body('words.*.image_url')
      .optional()
      .isURL()
      .withMessage('Image URL for each word must be a valid URL format.'),
    body('words.*.exampleSentence')
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 255 })
      .withMessage(
        'Example sentence for each word must be between 2 and 255 characters.'
      ),
    body('words.*.synonyms')
      .optional()
      .isArray()
      .withMessage('Synonyms for each word must be an array.'),
    body('words.*.synonyms.*')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Each synonym must be a non-empty string.'),
    handleValidationErrors,
  ],

  updateWord: [
    param('wordId')
      .isUUID()
      .withMessage('URL parameter wordId must be a valid UUID.'),
    body('term').optional().trim().notEmpty().withMessage('Term cannot be empty.'),
    body('definition')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Definition cannot be empty.'),
    body('translation').optional({ nullable: true }).isString(),
    body('image_url')
      .optional({ nullable: true })
      .isURL()
      .withMessage('Image URL must be a valid URL format.'),
    body('exampleSentence')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ min: 2, max: 255 })
      .withMessage('Example sentence must be between 2 and 255 characters.'),
    body('synonyms')
      .optional({ nullable: true })
      .isArray()
      .withMessage('Synonyms must be an array of strings.'),
    body('synonyms.*')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Synonyms cannot be empty strings.'),
    handleValidationErrors,
  ],
};

module.exports = vocabularyValidator;
