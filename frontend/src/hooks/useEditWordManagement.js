import { useState, useCallback } from "react";
import { useConfirm } from "../components/Providers/ConfirmProvider.jsx";
import { useToast } from "../components/Providers/ToastProvider.jsx";
import vocabularyService from "../services/Vocabulary/vocabularyService";
import { EMPTY_WORD } from "../constants/vocabulary.js";

export const useEditWordManagement = () => {
  const [words, setWords] = useState([]);
  const [originalWords, setOriginalWords] = useState([]);
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [loadingAI, setLoadingAI] = useState(new Set());

  const confirm = useConfirm();
  const toast = useToast();

  const normalizeSynonyms = useCallback((input) => {
    if (!input) return [];
    if (typeof input === "string") {
      return input
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    }
    return [];
  }, []);

  const addWord = useCallback(() => {
    setWords((prev) => [...prev, { ...EMPTY_WORD }]);
  }, []);

  const deleteWord = useCallback(
    async (index) => {
      const confirmed = await confirm(
        "Are you sure you want to delete this word?"
      );
      if (!confirmed) return;

      setWords((prev) => prev.filter((_, i) => i !== index));
      setSelectedWordIds((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(words[index]?.id);
        return newSelected;
      });
    },
    [confirm, words]
  );

  const deleteSelectedWords = useCallback(async () => {
    const confirmed = await confirm("Delete selected words?");
    if (!confirmed) return;

    setWords((prev) => prev.filter((word) => !selectedWordIds.has(word.id)));
    setSelectedWordIds(new Set());
  }, [confirm, selectedWordIds]);

  const updateWord = useCallback((index, field, value) => {
    setWords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Edit-specific: Toggle selection by word ID, not index
  const toggleWordSelection = useCallback(
    (index) => {
      const word = words[index];
      if (!word?.id) return; // Can't select words without IDs

      setSelectedWordIds((prev) => {
        const updated = new Set(prev);
        if (updated.has(word.id)) {
          updated.delete(word.id);
        } else {
          updated.add(word.id);
        }
        return updated;
      });
    },
    [words]
  );

  // Edit-specific: Handle both existing and new words for AI generation
  const generateExample = useCallback(
    async (index) => {
      // Validate inputs first
      if (index < 0 || index >= words.length) {
        console.error("Invalid word index:", index);
        toast("Invalid word selection. Please refresh and try again.", "error");
        return;
      }

      const word = words[index];

      if (!word) {
        console.error("Word not found at index:", index);
        toast("Word not found. Please refresh and try again.", "error");
        toast("Word not found.", "error");
        return;
      }

      if (!word.term?.trim() || !word.definition?.trim()) {
        toast("Please add term and definition first.", "error");
        return;
      }

      // Prevent double-clicking
      if (loadingAI.has(index)) {
        return;
      }

      setLoadingAI((prev) => new Set(prev).add(index));

      try {
        let response;

        // If word has an ID (existing word), use the word-specific endpoint
        if (word.id) {
          response = await vocabularyService.generateExample(word.id, {
            // Don't send context parameter if not needed (context is optional)
          });
        } else {
          // If word doesn't have ID (new word), use the general endpoint
          response = await vocabularyService.generateExample(null, {
            term: word.term,
            definition: word.definition,
          });
        }

        console.log("AI Response:", response); // Debug log

        if (response?.data?.example) {
          try {
            // Use functional update to ensure we have the latest state
            setWords((currentWords) => {
              if (index >= currentWords.length) {
                console.error("Word index out of bounds during update:", index);
                return currentWords;
              }

              const updated = [...currentWords];
              const exampleText =
                response.data.example.example || response.data.example;

              updated[index] = {
                ...updated[index],
                exampleSentence: exampleText,
                // Store AI metadata for ALL words (both new and existing)
                aiGenerated: response.data.example.aiGenerated || true,
                generationPrompt:
                  response.data.example.generationPrompt || null,
              };

              return updated;
            });

            toast("Example generated successfully!", "success");
          } catch (stateError) {
            console.error("Error updating word state:", stateError);
            toast("Generated example but couldn't save it.", "error");
          }
        } else {
          console.error("Unexpected response structure:", response);
          toast("Failed to generate example. Please try again.", "error");
        }
      } catch (error) {
        console.error("Error generating example:", error);
        // More detailed error logging
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        }
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to generate example. Please try again.";
        toast(errorMessage, "error");
      } finally {
        setLoadingAI((prev) => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }
    },
    [words, toast, loadingAI]
  );

  // Return ALL words that have any content - both existing and new words must be validated
  const getValidWords = useCallback(() => {
    return words.filter((w) => {
      const hasMainContent =
        (w.term && w.term.trim() !== "") ||
        (w.definition && w.definition.trim() !== "");
      const hasOptionalContent =
        (w.phonetics && w.phonetics.trim() !== "") ||
        (w.exampleSentence && w.exampleSentence.trim() !== "") ||
        (w.synonyms && w.synonyms.toString().trim() !== "") ||
        (w.translation && w.translation.trim() !== "") ||
        (w.image && w.image.trim() !== "");

      // For EDIT: Any word with content (main or optional) should be validated
      // This includes both existing words (with ID) and new words (without ID)
      const hasAnyContent = hasMainContent || hasOptionalContent;

      if (hasAnyContent) {
        console.log(
          `Word "${w.term}" included for validation (${w.id ? "EXISTING" : "NEW"}):`,
          {
            hasMainContent,
            hasOptionalContent,
            isExisting: !!w.id,
            isNew: !w.id,
          }
        );
      }

      return hasAnyContent;
    });
  }, [words]);

  // Edit-specific: Get words for update operation - returns ALL words with content
  const getWordsForUpdate = useCallback(() => {
    const currentValidWords = getValidWords();

    console.log("Words for update operation:", {
      originalCount: originalWords.length,
      currentValidCount: currentValidWords.length,
      existingInCurrent: currentValidWords.filter((w) => w.id).length,
      newInCurrent: currentValidWords.filter((w) => !w.id).length,
    });

    return {
      originalWords,
      currentWords: currentValidWords,
    };
  }, [originalWords, getValidWords]);

  // Synchronized with useListManagement - improved word preparation
  const prepareWordsForSubmission = useCallback(() => {
    const validWords = getValidWords();
    return validWords.map((w) => ({
      term: w.term || "",
      definition: w.definition || "",
      phonetics: w.phonetics || "",
      synonyms: normalizeSynonyms(w.synonyms),
      translation: w.translation || "",
      // Always include exampleSentence to handle both adding and removing examples
      exampleSentence: w.exampleSentence || "",
      // Include AI metadata only when we have an example with content
      ...(w.exampleSentence && w.exampleSentence.trim() && w.aiGenerated
        ? {
            aiGenerated: w.aiGenerated,
            generationPrompt: w.generationPrompt || null,
          }
        : {}),
      // Keep ID for edit operations
      ...(w.id ? { id: w.id } : {}),
    }));
  }, [getValidWords, normalizeSynonyms]);

  return {
    words,
    setWords,
    originalWords,
    setOriginalWords,
    selectedWordIds,
    loadingAI,
    addWord,
    deleteWord,
    deleteSelectedWords,
    updateWord,
    toggleWordSelection,
    generateExample,
    getValidWords,
    getWordsForUpdate,
    prepareWordsForSubmission,
  };
};
