import React from 'react';
import WordCard from './WordCard.jsx';

const WordsSection = ({
  words,
  selectedWordIds,
  loadingAI,
  validationErrors,
  onWordChange,
  onDeleteWord,
  onToggleWordSelection,
  onGenerateExample,
  onDeleteSelectedWords,
  onAddWord,
}) => {
  return (
    <>
      <h1 className="create-list__header">Add words</h1>
      
      {selectedWordIds.size > 0 && (
        <div className="create-list__delete-wrapper">
          <button
            type="button"
            className="create-list__delete-selected"
            onClick={onDeleteSelectedWords}
          >
            Delete selected
          </button>
        </div>
      )}
      
      <div className="create-list__word-list">
        {words.map((word, index) => (
          <WordCard
            key={word.id || index}
            word={word}
            index={index}
            isSelected={selectedWordIds.has(index)}
            isGeneratingExample={loadingAI.has(index)}
            validationErrors={validationErrors}
            onWordChange={onWordChange}
            onDelete={onDeleteWord}
            onToggleSelect={onToggleWordSelection}
            onGenerateExample={onGenerateExample}
          />
        ))}
      </div>

      <div className="create-list__add-button-wrapper">
        <button
          type="button"
          className="create-list__add-button"
          onClick={onAddWord}
        >
          Add word
        </button>
      </div>
    </>
  );
};

export default WordsSection;