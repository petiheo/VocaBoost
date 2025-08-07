import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Providers/ToastProvider.jsx";
import vocabularyService from "../services/Vocabulary/vocabularyService";
import { validateCreateListForm } from "../utils/createListValidation.js";
import { scrollToFirstError } from "../utils/scrollToError.js";

export const useEditListManagement = (
  listId,
  validationHook,
  wordManagementHook
) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [originalList, setOriginalList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { setErrors } = validationHook;
  const {
    getValidWords,
    setWords,
    setOriginalWords,
    words,
    getWordsForUpdate,
  } = wordManagementHook;

  // Load existing list data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch tags
        const tags = await vocabularyService.getAllTags();
        setAvailableTags(tags);

        // Fetch list data
        const list = await vocabularyService.getListById(listId);
        const wordsList = await vocabularyService.getWordsByListId(listId);

        // Map words to match component format
        const mappedWords = wordsList.map((w) => ({
          id: w.id,
          term: w.term,
          definition: w.definition,
          phonetics: w.phonetics || "",
          image: w.image_url || "",
          exampleSentence: w.vocabulary_examples?.example_sentence || "",
          translation: w.translation || "",
          // Convert synonyms array to comma-separated string for form input
          synonyms: Array.isArray(w.synonyms)
            ? w.synonyms.join(", ")
            : w.synonyms || "",
          // Include AI metadata for existing examples
          aiGenerated: w.vocabulary_examples?.ai_generated || false,
          generationPrompt: w.vocabulary_examples?.generation_prompt || null,
        }));

        // Set list metadata
        setTitle(list.title);
        setDescription(list.description);
        setPrivacy(list.privacy_setting);
        setSelectedTags(list.tags || []);

        // Set original data for cancellation
        setOriginalList({
          title: list.title,
          description: list.description,
          privacy: list.privacy_setting,
          tags: list.tags || [],
        });

        // Set words
        setWords(mappedWords);
        setOriginalWords(mappedWords);
      } catch (error) {
        console.error("Failed to fetch list data:", error);
        toast("Could not load list data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (listId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]); // Intentionally excluding setWords, setOriginalWords, toast to prevent re-fetching on state changes

  // Function to format validation errors for display (synchronized with useListManagement)
  const formatValidationErrors = useCallback((errors) => {
    const errorMessages = [];

    // Title errors
    if (errors.title) {
      errorMessages.push(`Title: ${errors.title.join(", ")}`);
    }

    // Description errors
    if (errors.description) {
      errorMessages.push(`Description: ${errors.description.join(", ")}`);
    }

    // Word errors
    if (errors.words) {
      Object.keys(errors.words).forEach((wordIndex) => {
        const wordErrors = errors.words[wordIndex];
        const wordNum = parseInt(wordIndex) + 1;

        // Check if this word has both term and definition errors (common case)
        const hasTermError = wordErrors.term;
        const hasDefinitionError = wordErrors.definition;

        if (hasTermError && hasDefinitionError) {
          // Combine both errors for better UX
          errorMessages.push(
            `Word ${wordNum}: Both term and definition are required`
          );
        } else {
          // Show individual field errors
          Object.keys(wordErrors).forEach((field) => {
            const fieldErrors = wordErrors[field];
            const fieldName =
              field === "term"
                ? "Term"
                : field === "definition"
                  ? "Definition"
                  : field === "exampleSentence"
                    ? "Example"
                    : field === "phonetics"
                      ? "Phonetics"
                      : field === "synonyms"
                        ? "Synonyms"
                        : field === "translation"
                          ? "Translation"
                          : field;

            errorMessages.push(
              `Word ${wordNum} ${fieldName}: ${fieldErrors.join(", ")}`
            );
          });
        }
      });
    }

    return errorMessages;
  }, []);

  const handleTitleChange = useCallback(
    (e) => {
      setTitle(e.target.value);
      validationHook.clearFieldError("title");
    },
    [validationHook]
  );

  const handleDescriptionChange = useCallback(
    (e) => {
      setDescription(e.target.value);
      validationHook.clearFieldError("description");
    },
    [validationHook]
  );

  const handleCancel = useCallback(() => {
    if (!originalList) return;

    // Reset to original values
    setTitle(originalList.title);
    setDescription(originalList.description);
    setPrivacy(originalList.privacy);
    setSelectedTags(originalList.tags);

    navigate("/vocabulary");
  }, [originalList, navigate]);

  const normalizeSynonyms = (input) => {
    if (!input) return [];
    if (typeof input === "string") {
      return input
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    }
    return [];
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Prevent multiple submissions
      if (isSubmitting) return;

      setIsSubmitting(true);

      // Get ALL words from word management hook - BOTH existing and new words must be validated
      const allWords = words || [];

      console.log("All words from hook (existing + new):", allWords);

      // FOR EDIT: ALL words (existing + new) must pass validation - no exceptions
      // We differentiate between truly empty rows vs partial/complete words
      const wordsToValidate = allWords.map((word, originalIndex) => {
        const hasMainContent =
          (word.term && word.term.trim() !== "") ||
          (word.definition && word.definition.trim() !== "");
        const hasOptionalContent =
          (word.phonetics && word.phonetics.trim() !== "") ||
          (word.exampleSentence && word.exampleSentence.trim() !== "") ||
          (word.synonyms && word.synonyms.toString().trim() !== "") ||
          (word.translation && word.translation.trim() !== "") ||
          (word.image && word.image.trim() !== "");

        const isEmpty = !hasMainContent && !hasOptionalContent;

        return {
          word,
          originalIndex,
          isEmpty,
          shouldValidate: !isEmpty, // All non-empty words must be validated
          isExisting: !!word.id, // Track if this is an existing word
          isNew: !word.id, // Track if this is a new word
        };
      });

      // ALL non-empty words (both existing and new) must pass validation
      const nonEmptyWordsWithIndex = wordsToValidate.filter(
        (item) => item.shouldValidate
      );

      console.log("Words to validate (existing + new):", {
        total: nonEmptyWordsWithIndex.length,
        existing: nonEmptyWordsWithIndex.filter((item) => item.isExisting)
          .length,
        new: nonEmptyWordsWithIndex.filter((item) => item.isNew).length,
        details: nonEmptyWordsWithIndex.map((item) => ({
          index: item.originalIndex,
          term: item.word.term,
          isExisting: item.isExisting,
          isNew: item.isNew,
        })),
      });

      console.log(
        "Words to validate with original indices:",
        nonEmptyWordsWithIndex
      );

      // Normalize ALL non-empty words (existing + new) to match validation schema
      const normalizedWordsWithIndex = nonEmptyWordsWithIndex.map((item) => {
        const { word, originalIndex, isExisting, isNew } = item;
        const normalized = {
          term: word.term || "",
          definition: word.definition || "",
          phonetics: word.phonetics || "",
          exampleSentence: word.exampleSentence || "",
          synonyms: word.synonyms || "",
          translation: word.translation || "",
          _originalIndex: originalIndex, // Keep track of original position
          _isExisting: isExisting, // Track if this is an existing word
          _isNew: isNew, // Track if this is a new word
        };

        console.log(
          `Word at position ${originalIndex + 1} (${isExisting ? "EXISTING" : "NEW"}) normalized:`,
          {
            original: word,
            normalized,
          }
        );

        return normalized;
      });

      // Extract just the normalized words for validation (without metadata)
      const normalizedWords = normalizedWordsWithIndex.map(
        ({ _originalIndex, _isExisting, _isNew, ...word }) => word
      );

      console.log(
        "Normalized words for validation (ALL non-empty words):",
        normalizedWords
      );

      // Validate ALL non-empty words (both existing and new) using the same validation rules
      const validation = validateCreateListForm(
        title,
        description,
        normalizedWords
      );

      // Map validation errors back to original indices
      if (validation.errors.words) {
        const remappedWordErrors = {};
        Object.keys(validation.errors.words).forEach((validationIndex) => {
          const originalIndex =
            normalizedWordsWithIndex[parseInt(validationIndex)]._originalIndex;
          const isExisting =
            normalizedWordsWithIndex[parseInt(validationIndex)]._isExisting;
          const isNew =
            normalizedWordsWithIndex[parseInt(validationIndex)]._isNew;

          console.log(
            `Mapping validation error for word at validation index ${validationIndex} -> original index ${originalIndex} (${isExisting ? "EXISTING" : "NEW"})`
          );

          remappedWordErrors[originalIndex] =
            validation.errors.words[validationIndex];
        });
        validation.errors.words = remappedWordErrors;
      }

      console.log(
        "Validation result with remapped indices (ALL words validated):",
        validation
      );

      setErrors(validation.errors);

      if (!validation.isValid) {
        setIsSubmitting(false);

        console.log("Validation failed with errors:", validation.errors);

        // Format and display detailed error messages
        const errorMessages = formatValidationErrors(validation.errors);
        console.log("Formatted error messages:", errorMessages);

        if (errorMessages.length > 0) {
          // Show multiple error messages if needed
          const mainMessage = errorMessages.slice(0, 2).join("; ");
          const additionalCount =
            errorMessages.length > 2
              ? ` (+${errorMessages.length - 2} more)`
              : "";
          const errorCount = errorMessages.length;
          toast(
            `${errorCount} validation errors found. Please check your inputs.`,
            "error"
          );

          // Auto-scroll to first error
          setTimeout(() => {
            scrollToFirstError(validation.errors, "edit-list");
          }, 100);

          // Also log all errors for debugging
          console.error(
            "All validation errors (existing + new words):",
            errorMessages
          );
        } else {
          toast("Please fix the validation errors before submitting.", "error");
        }
        return;
      }

      console.log(
        "Validation passed for ALL words, proceeding with submission..."
      );

      try {
        // Update list metadata
        const updatePayload = {
          title,
          description,
          privacy_setting: privacy,
          tags: selectedTags,
        };

        await vocabularyService.updateList(listId, updatePayload);

        // Handle word updates and deletions using improved logic
        // Get ALL current words that passed validation (both existing and new)
        const { originalWords } = getWordsForUpdate();

        // Only process words that passed validation AND have both term and definition
        const validatedCompleteWords = normalizedWordsWithIndex
          .map((item) => {
            // Find the original word with all its properties
            const originalWord = allWords[item._originalIndex];
            return {
              ...originalWord,
              // Ensure we have the normalized/cleaned data
              term: item.term,
              definition: item.definition,
              phonetics: item.phonetics,
              exampleSentence: item.exampleSentence,
              synonyms: item.synonyms,
              translation: item.translation,
              _isExisting: item._isExisting,
              _isNew: item._isNew,
            };
          })
          .filter(
            (word) => word.term.trim() !== "" && word.definition.trim() !== ""
          );

        console.log("Validated complete words for processing:", {
          total: validatedCompleteWords.length,
          existing: validatedCompleteWords.filter((w) => w._isExisting).length,
          new: validatedCompleteWords.filter((w) => w._isNew).length,
          details: validatedCompleteWords.map((w) => ({
            term: w.term,
            hasId: !!w.id,
            isExisting: w._isExisting,
            isNew: w._isNew,
          })),
        });

        // Delete words that were removed (only existing words that are no longer present)
        const originalWordIds = new Set(
          originalWords.map((w) => w.id).filter((id) => id)
        );
        const currentWordIds = new Set(
          validatedCompleteWords.filter((w) => w.id).map((w) => w.id)
        );
        const deletedWordIds = [...originalWordIds].filter(
          (id) => !currentWordIds.has(id)
        );

        console.log(
          "Words to delete (removed existing words):",
          deletedWordIds
        );

        for (const deletedId of deletedWordIds) {
          try {
            await vocabularyService.deleteWord(deletedId);
            console.log(`Successfully deleted word ID: ${deletedId}`);
          } catch (deleteError) {
            console.error(
              `Failed to delete word ID ${deletedId}:`,
              deleteError
            );
            // Continue with other operations even if one delete fails
          }
        }

        // Process all validated complete words (both existing updates and new creations)
        let updatedCount = 0;
        let createdCount = 0;

        for (const word of validatedCompleteWords) {
          const wordPayload = {
            term: word.term,
            definition: word.definition,
            phonetics: word.phonetics || "",
            // Always include exampleSentence to handle both adding and removing examples
            exampleSentence: word.exampleSentence || "",
            // Include AI metadata only when we have an example with content
            ...(word.exampleSentence &&
            word.exampleSentence.trim() &&
            word.aiGenerated
              ? {
                  aiGenerated: word.aiGenerated,
                  generationPrompt: word.generationPrompt,
                }
              : {}),
            translation: word.translation || "",
            synonyms: normalizeSynonyms(word.synonyms),
            ...(word.image ? { image_url: word.image } : {}),
          };

          console.log(
            `Processing word: "${word.term}" (${word._isExisting ? "EXISTING" : "NEW"}), has ID: ${!!word.id}`
          );

          try {
            if (word.id && word._isExisting) {
              // Update existing word - must pass validation first
              await vocabularyService.updateWord(word.id, wordPayload);
              console.log(`Updated existing word with ID: ${word.id}`);
              updatedCount++;
            } else if (word._isNew) {
              // Create new word - must pass validation first
              wordPayload.listId = listId;
              const newWord = await vocabularyService.createWord(wordPayload);
              console.log(
                `Created new word with returned data:`,
                newWord?.data
              );
              createdCount++;
            }
          } catch (wordError) {
            console.error(`Failed to process word "${word.term}":`, wordError);
            // Continue with other words even if one fails
          }
        }

        console.log(
          `Word processing completed: ${updatedCount} updated, ${createdCount} created`
        );

        // Fetch updated words from server to sync state
        try {
          const updatedWordsList =
            await vocabularyService.getWordsByListId(listId);

          if (updatedWordsList && updatedWordsList.length > 0) {
            const mappedUpdatedWords = updatedWordsList.map((w) => ({
              id: w.id,
              term: w.term,
              definition: w.definition,
              phonetics: w.phonetics || "",
              image: w.image_url || "",
              exampleSentence: w.vocabulary_examples?.example_sentence || "",
              translation: w.translation || "",
              synonyms: Array.isArray(w.synonyms)
                ? w.synonyms.join(", ")
                : w.synonyms || "",
              aiGenerated: w.vocabulary_examples?.ai_generated || false,
              generationPrompt:
                w.vocabulary_examples?.generation_prompt || null,
            }));

            setWords(mappedUpdatedWords);
            setOriginalWords(mappedUpdatedWords);
            console.log(
              "Synced updated words from server:",
              mappedUpdatedWords
            );
          }
        } catch (syncError) {
          console.error("Failed to sync words after update:", syncError);
          // Don't fail the whole operation for sync issues
        }

        toast("List updated successfully!", "success");

        // Navigate faster like in useListManagement
        const navigationDelay = validatedCompleteWords.length > 0 ? 1000 : 500;
        setTimeout(() => navigate("/vocabulary"), navigationDelay);
      } catch (err) {
        console.error(
          "Error updating list:",
          err.response?.data || err.message
        );
        setIsSubmitting(false);

        // More detailed error handling
        if (err.response?.data?.message) {
          toast("Failed to update list.", "error");
        } else {
          toast("Failed to update list.", "error");
        }
      }
    },
    [
      title,
      description,
      privacy,
      selectedTags,
      listId,
      words,
      getWordsForUpdate,
      setErrors,
      setWords,
      setOriginalWords,
      formatValidationErrors,
      toast,
      navigate,
      validationHook,
      isSubmitting,
    ]
  );

  return {
    title,
    description,
    privacy,
    selectedTags,
    availableTags,
    originalList,
    isLoading,
    isSubmitting,
    setTitle,
    setDescription,
    setPrivacy,
    setSelectedTags,
    handleTitleChange,
    handleDescriptionChange,
    handleSubmit,
    handleCancel,
    formatValidationErrors,
  };
};
