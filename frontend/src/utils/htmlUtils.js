/**
 * Decode HTML entities from escaped strings
 * @param {string} str - The HTML-escaped string
 * @returns {string} - The decoded string
 */
export const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  // Create a temporary DOM element to decode HTML entities
  const textArea = document.createElement('textarea');
  textArea.innerHTML = str;
  return textArea.value;
};

/**
 * Decode HTML entities in vocabulary data
 * @param {Object} word - Word object with potential HTML entities
 * @returns {Object} - Word object with decoded text
 */
export const decodeVocabularyData = (word) => {
  if (!word) return word;
  
  return {
    ...word,
    term: decodeHtmlEntities(word.term),
    definition: decodeHtmlEntities(word.definition),
    translation: decodeHtmlEntities(word.translation),
    vocabulary_examples: word.vocabulary_examples ? {
      ...word.vocabulary_examples,
      example_sentence: decodeHtmlEntities(word.vocabulary_examples.example_sentence)
    } : word.vocabulary_examples,
    synonyms: Array.isArray(word.synonyms) 
      ? word.synonyms.map(decodeHtmlEntities)
      : word.synonyms
  };
};

/**
 * Decode HTML entities in an array of vocabulary words
 * @param {Array} words - Array of word objects
 * @returns {Array} - Array of decoded word objects
 */
export const decodeVocabularyList = (words) => {
  if (!Array.isArray(words)) return words;
  return words.map(decodeVocabularyData);
};