import React from "react";
import WordCard from "./WordCard.jsx";

const EditWordsSection = ({
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
      <h2 className="edit-list__header">Words</h2>

      {selectedWordIds.size > 0 && (
        <div className="edit-list__delete-wrapper">
          <button
            type="button"
            className="edit-list__delete-selected"
            onClick={onDeleteSelectedWords}
          >
            Delete selected
          </button>
        </div>
      )}

      <div className="edit-list__word-list">
        {words.map((word, index) => (
          <WordCard
            key={word.id || index}
            word={word}
            index={index}
            isSelected={selectedWordIds.has(word.id)}
            isGeneratingExample={loadingAI.has(index)}
            validationErrors={validationErrors}
            onWordChange={onWordChange}
            onDelete={onDeleteWord}
            onToggleSelect={onToggleWordSelection}
            onGenerateExample={onGenerateExample}
            classPrefix="edit-list"
          />
        ))}
      </div>

      <div className="edit-list__add-button-wrapper">
        <button
          type="button"
          className="edit-list__add-button"
          onClick={onAddWord}
        >
          Add word
        </button>
      </div>
    </>
  );
};

export default EditWordsSection;
