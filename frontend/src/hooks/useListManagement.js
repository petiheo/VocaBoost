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
  const [createdListId, setCreatedListId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { setErrors } = validationHook;
  const { setWords, words } = wordManagementHook;

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
        cleanup();
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
      cleanup();
    };
  }, [createdListId, isSubmitted]);

  // Function to cleanup temporary list
  const cleanupTemporaryList = useCallback(async () => {
    if (createdListId && !isSubmitted) {
      try {
        await vocabularyService.deleteList(createdListId);
        setCreatedListId(null);
        console.log('Cleaned up temporary list:', createdListId);
      } catch (error) {
        console.error('Failed to cleanup temporary list:', error);
      }
    }
  }, [createdListId, isSubmitted]);

  // Function to format validation errors for display
  const formatValidationErrors = useCallback((errors) => {
    let errorMessages = [];
    
    // Title errors
    if (errors.title) {
      errorMessages.push(`Title: ${errors.title.join(', ')}`);
    }
    
    // Description errors  
    if (errors.description) {
      errorMessages.push(`Description: ${errors.description.join(', ')}`);
    }
    
    // Word errors
    if (errors.words) {
      Object.keys(errors.words).forEach(wordIndex => {
        const wordErrors = errors.words[wordIndex];
        const wordNum = parseInt(wordIndex) + 1;
        
        // Check if this word has both term and definition errors (common case)
        const hasTermError = wordErrors.term;
        const hasDefinitionError = wordErrors.definition;
        
        if (hasTermError && hasDefinitionError) {
          // Combine both errors for better UX
          errorMessages.push(`Word ${wordNum}: Both term and definition are required`);
        } else {
          // Show individual field errors
          Object.keys(wordErrors).forEach(field => {
            const fieldErrors = wordErrors[field];
            const fieldName = field === 'term' ? 'Term' : 
                             field === 'definition' ? 'Definition' :
                             field === 'exampleSentence' ? 'Example' :
                             field === 'phonetics' ? 'Phonetics' :
                             field === 'synonyms' ? 'Synonyms' :
                             field === 'translation' ? 'Translation' : field;
            
            errorMessages.push(`Word ${wordNum} ${fieldName}: ${fieldErrors.join(', ')}`);
          });
        }
      });
    }
    
    return errorMessages;
  }, []);

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    validationHook.clearFieldError('title');
  }, [validationHook]);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
    validationHook.clearFieldError('description');
  }, [validationHook]);

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
          window.history.replaceState(null, '', `/vocabulary/create/${newListId}`);
        }
      } catch (error) {
        console.error('Failed to create temporary list:', error);
      }
    }
  }, [isNewList, createdListId, title, description, privacy, selectedTags]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isNewList && title.length > 5) {
        createTemporaryList();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, description, createTemporaryList, isNewList]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    // Get ALL words from word management hook (not just valid ones)
    const allWords = words || [];
    
    console.log('All words from hook:', allWords);
    
    // Instead of filtering, we'll validate ALL words and track their original indices
    const wordsToValidate = allWords.map((word, originalIndex) => {
      const hasMainContent = (word.term && word.term.trim() !== '') || 
                            (word.definition && word.definition.trim() !== '');
      const hasOptionalContent = (word.phonetics && word.phonetics.trim() !== '') ||
                                 (word.exampleSentence && word.exampleSentence.trim() !== '') ||
                                 (word.synonyms && word.synonyms.toString().trim() !== '') ||
                                 (word.translation && word.translation.trim() !== '');
      
      const isEmpty = !hasMainContent && !hasOptionalContent;
      
      return {
        word,
        originalIndex,
        isEmpty,
        shouldValidate: !isEmpty
      };
    });
    
    // Only validate non-empty words but keep track of original indices
    const nonEmptyWordsWithIndex = wordsToValidate.filter(item => item.shouldValidate);
    
    console.log('Words to validate with original indices:', nonEmptyWordsWithIndex);
    
    // Normalize words to match validation schema, preserving original indices
    const normalizedWordsWithIndex = nonEmptyWordsWithIndex.map((item) => {
      const { word, originalIndex } = item;
      const normalized = {
        term: word.term || '',
        definition: word.definition || '',
        phonetics: word.phonetics || '',
        exampleSentence: word.exampleSentence || '',
        synonyms: word.synonyms || '',
        translation: word.translation || '',
        _originalIndex: originalIndex // Keep track of original position
      };
      
      console.log(`Word at position ${originalIndex + 1} normalized:`, {
        original: word,
        normalized: normalized
      });
      
      return normalized;
    });
    
    // Extract just the normalized words for validation (without _originalIndex)
    const normalizedWords = normalizedWordsWithIndex.map(({ _originalIndex, ...word }) => word);
    
    console.log('Normalized words for validation:', normalizedWords);
    
    // Validate form with the normalized words using your validation file
    const validation = validateCreateListForm(title, description, normalizedWords);
    
    // Map validation errors back to original indices
    if (validation.errors.words) {
      const remappedWordErrors = {};
      Object.keys(validation.errors.words).forEach(validationIndex => {
        const originalIndex = normalizedWordsWithIndex[parseInt(validationIndex)]._originalIndex;
        remappedWordErrors[originalIndex] = validation.errors.words[validationIndex];
      });
      validation.errors.words = remappedWordErrors;
    }
    
    console.log('Validation result with remapped indices:', validation);
    
    setErrors(validation.errors);

    if (!validation.isValid) {
      setIsSubmitting(false);
      // Cleanup temporary list if validation fails
      await cleanupTemporaryList();
      
      console.log('Validation failed with errors:', validation.errors);
      
      // Format and display detailed error messages
      const errorMessages = formatValidationErrors(validation.errors);
      console.log('Formatted error messages:', errorMessages);
      
      if (errorMessages.length > 0) {
        // Show multiple error messages if needed
        const mainMessage = errorMessages.slice(0, 2).join('; ');
        const additionalCount = errorMessages.length > 2 ? ` (+${errorMessages.length - 2} more)` : '';
        toast(`Validation errors: ${mainMessage}${additionalCount}`, "error");
        
        // Also log all errors for debugging
        console.error('All validation errors:', errorMessages);
      } else {
        toast("Please fix the validation errors before submitting.", "error");
      }
      return;
    }
    
    console.log('Validation passed, proceeding with submission...');

    // Only set isSubmitted to true AFTER all validations pass
    setIsSubmitted(true);

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
        setCreatedListId(actualListId);
      } else {
        await vocabularyService.updateList(actualListId, listData);
        createdList = { id: actualListId };
      }

      // Add words if any exist and ALL are valid
      if (normalizedWords && normalizedWords.length > 0) {
        try {
          // Only submit words that have both term and definition (the truly complete ones)
          const completeWords = normalizedWords.filter(word => 
            word.term.trim() !== '' && word.definition.trim() !== ''
          );
          
          if (completeWords.length === 0) {
            // This shouldn't happen if validation passed, but just in case
            console.log('No complete words to submit after validation passed');
          } else {
            // Prepare words for submission
            const wordsToSubmit = completeWords.map(word => ({
              term: word.term,
              definition: word.definition,
              phonetics: word.phonetics || "",
              synonyms: word.synonyms ? (typeof word.synonyms === 'string' ? 
                word.synonyms.split(',').map(s => s.trim()).filter(s => s !== '') : 
                word.synonyms) : [],
              translation: word.translation || "",
              exampleSentence: word.exampleSentence || "",
              aiGenerated: word.aiGenerated || false,
              generationPrompt: word.generationPrompt || null,
            }));
            
            const wordPayload = {
              listId: actualListId,
              words: wordsToSubmit,
            };

            console.log('Submitting words payload:', wordPayload); // Debug log

            await vocabularyService.createWordsBulk(wordPayload);

            // Fetch updated words from server to get IDs
            const insertedWords = await vocabularyService.getWordsByListId(actualListId);
            
            if (insertedWords && insertedWords.length > 0) {
              // Map the inserted words back to the local state
              const allWordsFromHook = words || [];
              const updatedWords = allWordsFromHook.map((localWord, index) => {
                // Only update words that were actually submitted
                if (localWord.term && localWord.definition) {
                  const insertedWord = insertedWords.find(w => 
                    w.word === localWord.term || 
                    w.term === localWord.term ||
                    insertedWords[index] // fallback to index matching
                  );
                  
                  return {
                    ...localWord,
                    id: insertedWord?.id || null,
                  };
                }
                return localWord; // Keep unchanged if not submitted
              });
              
              setWords(updatedWords);
              console.log('Updated words with IDs:', updatedWords); // Debug log
            }
          }
        } catch (wordError) {
          console.error("Error adding words:", wordError);
          // Don't reset isSubmitted here - list was created successfully
          toast("List created but some words failed to save. Please edit the list to add them.", "warning");
          setTimeout(() => navigate("/vocabulary"), 1000); // Reduced from 2000ms
          return;
        }
      }

      toast("List created successfully!", "success");
      
      // Navigate faster if no words to process
      const navigationDelay = (normalizedWords && normalizedWords.length > 0) ? 1000 : 500;
      setTimeout(() => navigate("/vocabulary"), navigationDelay);
      
    } catch (err) {
      console.error("Error creating list:", err);
      setIsSubmitted(false); // Reset on error so cleanup can work if user tries again
      setIsSubmitting(false);
      // Try to cleanup if there was a temporary list created
      await cleanupTemporaryList();
      toast("Failed to create list. Please try again.", "error");
    }
  }, [
    title,
    description,
    privacy,
    selectedTags,
    listId,
    createdListId,
    words,
    cleanupTemporaryList,
    formatValidationErrors,
    setErrors,
    setWords,
    toast,
    navigate,
  ]);

  const handleCancel = useCallback(async () => {
    await cleanupTemporaryList();
    navigate('/vocabulary');
  }, [cleanupTemporaryList, navigate]);

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
    isSubmitting,
    formatValidationErrors,
  };
};