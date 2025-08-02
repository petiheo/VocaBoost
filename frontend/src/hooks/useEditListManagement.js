import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Providers/ToastProvider.jsx';
import vocabularyService from '../services/Vocabulary/vocabularyService';
import { validateCreateListForm } from '../utils/createListValidation.js';

export const useEditListManagement = (listId, validationHook, wordManagementHook) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [originalList, setOriginalList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { setErrors } = validationHook;
  const { getValidWords, setWords, setOriginalWords } = wordManagementHook;

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
        const words = await vocabularyService.getWordsByListId(listId);

        // Map words to match component format
        const mappedWords = words.map((w) => ({
          id: w.id,
          term: w.term,
          definition: w.definition,
          phonetics: w.phonetics || "",
          image: w.image_url || "",
          exampleSentence: w.vocabulary_examples?.example_sentence || "",
          translation: w.translation || "",
          // Convert synonyms array to comma-separated string for form input
          synonyms: Array.isArray(w.synonyms) ? w.synonyms.join(", ") : (w.synonyms || ""),
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
        console.error('Failed to fetch list data:', error);
        toast('Failed to load list data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (listId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]); // Intentionally excluding setWords, setOriginalWords, toast to prevent re-fetching on state changes

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    validationHook.clearFieldError('title');
  }, [validationHook]);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
    validationHook.clearFieldError('description');
  }, [validationHook]);

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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const words = getValidWords();
    const validation = validateCreateListForm(title, description, words);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast("Please fix the validation errors before submitting.", "error");
      return;
    }

    try {
      // Update list metadata
      const updatePayload = {
        title,
        description,
        privacy_setting: privacy,
        tags: selectedTags,
      };

      await vocabularyService.updateList(listId, updatePayload);

      // Handle word updates and deletions
      const { originalWords, currentWords } = wordManagementHook.getWordsForUpdate();
      
      // Delete removed words
      const originalWordIds = new Set(originalWords.map(w => w.id));
      const currentWordIds = new Set(currentWords.filter(w => w.id).map(w => w.id));
      const deletedWordIds = [...originalWordIds].filter(id => !currentWordIds.has(id));

      for (const deletedId of deletedWordIds) {
        await vocabularyService.deleteWord(deletedId);
      }

      // Update and create words
      for (const word of currentWords) {
        const wordPayload = {
          term: word.term,
          definition: word.definition,
          phonetics: word.phonetics || "",
          exampleSentence: word.exampleSentence || "",
          translation: word.translation || "",
          synonyms: normalizeSynonyms(word.synonyms),
          ...(word.image ? { image_url: word.image } : {}),
          // Add AI metadata for new words
          ...(word.aiGenerated ? { 
            aiGenerated: word.aiGenerated,
            generationPrompt: word.generationPrompt 
          } : {}),
        };

        if (word.id) {
          // Update existing word
          await vocabularyService.updateWord(word.id, wordPayload);
        } else {
          // Create new word
          wordPayload.listId = listId;
          await vocabularyService.createWord(wordPayload);
        }
      }

      toast("List updated successfully!", "success");
      setTimeout(() => navigate("/vocabulary"), 2000);

    } catch (err) {
      console.error("Error updating list:", err.response?.data || err.message);
      toast("Failed to update list.", "error");
    }
  }, [
    title,
    description,
    privacy,
    selectedTags,
    listId,
    getValidWords,
    setErrors,
    toast,
    navigate,
    wordManagementHook,
  ]);

  return {
    title,
    description,
    privacy,
    selectedTags,
    availableTags,
    originalList,
    isLoading,
    setTitle,
    setDescription,
    setPrivacy,
    setSelectedTags,
    handleTitleChange,
    handleDescriptionChange,
    handleSubmit,
    handleCancel,
  };
};