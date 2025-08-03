import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Providers/ToastProvider.jsx';
import vocabularyService from '../services/Vocabulary/vocabularyService';
import { validateCreateListForm } from '../utils/createListValidation.js';

export const useListManagement = (listId, validationHook, wordManagementHook, isNewList = false) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [createdListId, setCreatedListId] = useState(null); // Track list created during session
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if form was submitted
  
  const navigate = useNavigate();
  const toast = useToast();
  const { setErrors } = validationHook;
  const { prepareWordsForSubmission, getValidWords, setWords } = wordManagementHook;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await vocabularyService.getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, []);

  // Cleanup effect for abandoned lists
  useEffect(() => {
    const cleanup = async () => {
      if (createdListId && !isSubmitted) {
        try {
          await vocabularyService.deleteList(createdListId);
        } catch (error) {
          console.error('Failed to cleanup abandoned list:', error);
        }
      }
    };

    const handleBeforeUnload = (e) => {
      if (createdListId && !isSubmitted) {
        // For modern browsers, this will trigger cleanup
        cleanup();
        // Note: Custom messages are no longer supported in most browsers
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && createdListId && !isSubmitted) {
        cleanup();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Final cleanup on unmount
      cleanup();
    };
  }, [createdListId, isSubmitted]);

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    validationHook.clearFieldError('title');
  }, [validationHook]);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
    validationHook.clearFieldError('description');
  }, [validationHook]);

  // Create a temporary list when user starts adding significant content
  const createTemporaryList = useCallback(async () => {
    if (isNewList && !createdListId && (title.trim() || description.trim())) {
      try {
        const tempData = {
          title: title.trim() || "Untitled List",
          description: description.trim() || "",
          privacy_setting: privacy,
          tags: selectedTags,
        };
        
        const res = await vocabularyService.createList(tempData);
        const newListId = res?.data?.list?.id;
        
        if (newListId) {
          setCreatedListId(newListId);
          // Update URL to reflect the created list
          window.history.replaceState(null, '', `/vocabulary/create/${newListId}`);
        }
      } catch (error) {
        console.error('Failed to create temporary list:', error);
      }
    }
  }, [isNewList, createdListId, title, description, privacy, selectedTags]);

  // Auto-create temporary list when user has significant content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isNewList && title.length > 5) {
        createTemporaryList();
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [title, description, createTemporaryList, isNewList]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const words = getValidWords();
    const validation = validateCreateListForm(title, description, words);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast("Please fix the validation errors before submitting.", "error");
      return;
    }

    const listData = {
      title,
      description,
      privacy_setting: privacy,
      tags: selectedTags,
    };

    try {
      let actualListId = listId || createdListId;
      let createdList;

      // Create or update list
      if (!actualListId) {
        const res = await vocabularyService.createList(listData);
        createdList = res?.data?.list;
        if (!createdList?.id) {
          throw new Error("Failed to create new list");
        }
        actualListId = createdList.id;
        setCreatedListId(actualListId); // Track the created list
      } else {
        await vocabularyService.updateList(actualListId, listData);
        createdList = { id: actualListId };
      }

      // Add words if any exist
      if (words.length > 0) {
        const wordPayload = {
          listId: actualListId,
          words: prepareWordsForSubmission(),
        };

        await vocabularyService.createWordsBulk(wordPayload);

        // Fetch and update words with IDs
        const insertedWords = await vocabularyService.getWordsByListId(createdList.id);
        const updatedWords = words.map((w, i) => ({
          ...w,
          id: insertedWords[i]?.id || null,
        }));
        setWords(updatedWords);
      }

      setIsSubmitted(true); // Mark as submitted to prevent cleanup
      toast("List created successfully!", "success");
      setTimeout(() => navigate("/vocabulary"), 2000);
    } catch (err) {
      console.error("Error creating list:", err);
      toast("Failed to create list. Please try again.", "error");
    }
  }, [
    title,
    description,
    privacy,
    selectedTags,
    listId,
    createdListId,
    getValidWords,
    prepareWordsForSubmission,
    setErrors,
    setWords,
    toast,
    navigate,
  ]);

  const handleCancel = useCallback(async () => {
    if (createdListId && !isSubmitted) {
      try {
        await vocabularyService.deleteList(createdListId);
      } catch (error) {
        console.error('Failed to delete abandoned list:', error);
      }
    }
    navigate('/vocabulary');
  }, [createdListId, isSubmitted, navigate]);

  return {
    title,
    description,
    privacy,
    selectedTags,
    availableTags,
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