import { useState, useCallback } from 'react';
import { useConfirm } from '../components/Providers/ConfirmProvider.jsx';
import { useToast } from '../components/Providers/ToastProvider.jsx';
import vocabularyService from '../services/Vocabulary/vocabularyService';
import { EMPTY_WORD, INITIAL_WORDS_COUNT } from '../constants/vocabulary.js';

export const useWordManagement = () => {
  const [words, setWords] = useState(
    Array(INITIAL_WORDS_COUNT).fill(null).map(() => ({ ...EMPTY_WORD }))
  );
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
    setWords(prev => [...prev, { ...EMPTY_WORD }]);
  }, []);

  const deleteWord = useCallback(async (index) => {
    const confirmed = await confirm("Are you sure you want to delete this word?");
    if (!confirmed) return;

    setWords(prev => prev.filter((_, i) => i !== index));
    setSelectedWordIds(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(words[index].id);
      return newSelected;
    });
  }, [confirm, words]);

  const deleteSelectedWords = useCallback(async () => {
    const confirmed = await confirm("Delete selected words?");
    if (!confirmed) return;

    setWords(prev => prev.filter((_, i) => !selectedWordIds.has(i)));
    setSelectedWordIds(new Set());
  }, [confirm, selectedWordIds]);

  const updateWord = useCallback((index, field, value) => {
    setWords(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const toggleWordSelection = useCallback((index) => {
    setSelectedWordIds(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  }, []);

  const generateExample = useCallback(async (index) => {
    const word = words[index];
    
    if (!word.term.trim() || !word.definition.trim()) {
      toast("Please add term and definition first.", "error");
      return;
    }

    setLoadingAI(prev => new Set(prev).add(index));

    try {
      const response = await vocabularyService.generateExample(null, {
        term: word.term,
        definition: word.definition,
      });

      if (response?.data?.example?.example) {
        const updatedWords = [...words];
        updatedWords[index] = {
          ...updatedWords[index],
          exampleSentence: response.data.example.example,
          aiGenerated: response.data.example.aiGenerated,
          generationPrompt: response.data.example.generationPrompt,
        };
        setWords(updatedWords);
        toast("Example generated successfully!", "success");
      } else {
        toast("Failed to generate example. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error generating example:", error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Failed to generate example. Please try again.";
      toast(errorMessage, "error");
    } finally {
      setLoadingAI(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  }, [words, toast]);

  const getValidWords = useCallback(() => {
    return words.filter(w => w.term && w.definition);
  }, [words]);

  const prepareWordsForSubmission = useCallback(() => {
    const validWords = getValidWords();
    const preparedWords = validWords.map(w => ({
      term: w.term,
      definition: w.definition,
      phonetics: w.phonetics || "",
      synonyms: normalizeSynonyms(w.synonyms),
      translation: w.translation || "",
      exampleSentence: w.exampleSentence || "",
      aiGenerated: w.aiGenerated || false,
      generationPrompt: w.generationPrompt || null,
    }));
    
    return preparedWords;
  }, [getValidWords, normalizeSynonyms]);

  return {
    words,
    setWords,
    selectedWordIds,
    loadingAI,
    addWord,
    deleteWord,
    deleteSelectedWords,
    updateWord,
    toggleWordSelection,
    generateExample,
    getValidWords,
    prepareWordsForSubmission,
  };
};