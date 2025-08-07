const he = require('he'); // HTML entity decoder library

/**
 * Decode HTML entities from vocabulary data
 * @param {Object} word - Word object with HTML entities
 * @returns {Object} - Word object with decoded text
 */
function decodeVocabularyData(word) {
  if (!word) return word;
  
  return {
    ...word,
    term: word.term ? he.decode(word.term) : word.term,
    definition: word.definition ? he.decode(word.definition) : word.definition,
    translation: word.translation ? he.decode(word.translation) : word.translation,
    vocabulary_examples: word.vocabulary_examples ? {
      ...word.vocabulary_examples,
      example_sentence: word.vocabulary_examples.example_sentence 
        ? he.decode(word.vocabulary_examples.example_sentence)
        : word.vocabulary_examples.example_sentence
    } : word.vocabulary_examples,
    synonyms: Array.isArray(word.synonyms) 
      ? word.synonyms.map(synonym => typeof synonym === 'string' ? he.decode(synonym) : synonym)
      : word.synonyms
  };
}

/**
 * Decode HTML entities in an array of vocabulary words
 * @param {Array} words - Array of word objects
 * @returns {Array} - Array of decoded word objects
 */
function decodeVocabularyList(words) {
  if (!Array.isArray(words)) return words;
  return words.map(decodeVocabularyData);
}

module.exports = {
  decodeVocabularyData,
  decodeVocabularyList
};