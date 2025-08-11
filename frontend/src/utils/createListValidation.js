// Validation utilities for Create List form

export const validateListTitle = (title) => {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
    return errors;
  }

  const trimmed = title.trim();

  if (trimmed.length < 3) {
    errors.push("Title must be at least 3 characters long");
  }

  if (trimmed.length > 100) {
    errors.push("Title must be less than 100 characters");
  }

  return errors;
};

export const validateListDescription = (description) => {
  const errors = [];

  // Description is now optional
  if (!description || description.trim().length === 0) {
    return errors; // No errors if empty - it's optional
  }

  const trimmed = description.trim();

  // Removed minimum length constraint - only check maximum length
  if (trimmed.length > 500) {
    errors.push("Description must be less than 500 characters");
  }

  return errors;
};

export const validateWordTerm = (term) => {
  const errors = [];

  if (!term || term.trim().length === 0) {
    errors.push("Term is required");
    return errors;
  }

  const trimmed = term.trim();

  if (trimmed.length < 1) {
    errors.push("Term cannot be empty");
  }

  if (trimmed.length > 100) {
    errors.push("Term must be less than 100 characters");
  }

  return errors;
};

export const validateWordDefinition = (definition) => {
  const errors = [];

  if (!definition || definition.trim().length === 0) {
    errors.push("Definition is required");
    return errors;
  }

  const trimmed = definition.trim();

  if (trimmed.length < 2) {
    errors.push("Definition must be at least 2 characters long");
  }

  if (trimmed.length > 500) {
    errors.push("Definition must be less than 500 characters");
  }

  return errors;
};

export const validateWordPhonetics = (phonetics) => {
  const errors = [];

  // Phonetics is optional
  if (!phonetics) return errors;

  const trimmed = phonetics.trim();

  if (trimmed.length > 100) {
    errors.push("Phonetics must be less than 100 characters");
  }

  return errors;
};

export const validateWordExampleSentence = (exampleSentence) => {
  const errors = [];

  // Example sentence is OPTIONAL (matching backend)
  if (!exampleSentence || exampleSentence.trim().length === 0) {
    return errors; // No errors if empty - it's optional
  }

  const trimmed = exampleSentence.trim();

  // When provided, must be between 2-255 characters (matching backend)
  if (trimmed.length < 2) {
    errors.push("Example sentence must be at least 2 characters long");
  }

  if (trimmed.length > 255) {
    errors.push("Example sentence must be less than 255 characters");
  }

  return errors;
};

export const validateWordSynonyms = (synonyms) => {
  const errors = [];

  // Synonyms is optional
  if (!synonyms) {
    return errors;
  }

  // Handle both string and array formats
  let synonymsString = "";
  if (Array.isArray(synonyms)) {
    // If it's an array, join with commas
    if (synonyms.length === 0) {
      return errors;
    }
    synonymsString = synonyms.join(",");
  } else if (typeof synonyms === "string") {
    // If it's already a string
    if (synonyms.trim().length === 0) {
      return errors;
    }
    synonymsString = synonyms;
  } else {
    // Invalid type
    return errors;
  }

  const trimmed = synonymsString.trim();

  // Check for invalid ending characters
  if (/[^a-zA-Z0-9)]$/.test(trimmed)) {
    errors.push("Synonyms cannot end with special characters");
  }

  // Check for consecutive commas
  if (trimmed.includes(",,")) {
    errors.push(
      "Synonyms must be properly separated by commas without extra spaces"
    );
  }

  return errors;
};

export const validateWordTranslation = (translation) => {
  const errors = [];

  // Translation is optional
  if (!translation) return errors;

  const trimmed = translation.trim();

  if (trimmed.length > 200) {
    errors.push("Translation must be less than 200 characters");
  }

  return errors;
};

// Validate entire word object
export const validateWord = (word) => {
  const errors = {};

  const termErrors = validateWordTerm(word.term);
  if (termErrors.length > 0) {
    errors.term = termErrors;
  }

  const definitionErrors = validateWordDefinition(word.definition);
  if (definitionErrors.length > 0) {
    errors.definition = definitionErrors;
  }

  const phoneticsErrors = validateWordPhonetics(word.phonetics);
  if (phoneticsErrors.length > 0) {
    errors.phonetics = phoneticsErrors;
  }

  const exampleErrors = validateWordExampleSentence(word.exampleSentence);
  if (exampleErrors.length > 0) {
    errors.exampleSentence = exampleErrors;
  }

  const synonymsErrors = validateWordSynonyms(word.synonyms);
  if (synonymsErrors.length > 0) {
    errors.synonyms = synonymsErrors;
  }

  const translationErrors = validateWordTranslation(word.translation);
  if (translationErrors.length > 0) {
    errors.translation = translationErrors;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

// Validate entire form
export const validateCreateListForm = (title, description, words) => {
  const errors = {};

  // Validate list details
  const titleErrors = validateListTitle(title);
  if (titleErrors.length > 0) {
    errors.title = titleErrors;
  }

  const descriptionErrors = validateListDescription(description);
  if (descriptionErrors.length > 0) {
    errors.description = descriptionErrors;
  }

  // Validate all words
  const wordErrors = {};
  let hasWordErrors = false;

  words.forEach((word, index) => {
    const wordValidation = validateWord(word);
    if (!wordValidation.isValid) {
      wordErrors[index] = wordValidation.errors;
      hasWordErrors = true;
    }
  });

  if (hasWordErrors) {
    errors.words = wordErrors;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
