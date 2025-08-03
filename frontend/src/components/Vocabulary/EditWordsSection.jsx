import React from 'react';
import { AccountPageInput } from '../index.jsx';

const EditWordsSection = ({
  words,
  selectedWordIds,
  loadingAI,
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
        {words.map((word, index) => {
          // For edit mode, selection is based on word.id, not index
          const isSelected = word.id ? selectedWordIds.has(word.id) : false;
          
          return (
            <div
              key={word.id || index}
              className={`edit-list__word-box ${isSelected ? 'edit-list__word-box--selected' : ''}`}
              onClick={(e) => {
                // Prevent selection on input/button clicks
                if (e.target.tagName !== 'INPUT' && 
                    e.target.tagName !== 'BUTTON' && 
                    e.target.tagName !== 'TEXTAREA' && 
                    e.target.tagName !== 'SELECT' && 
                    !e.target.closest('label')) {
                  onToggleWordSelection(index);
                }
              }}
            >
              <div className="edit-list__word-box--header">
                <div className="edit-list__word-box--index">{index + 1}</div>
                <button
                  className="edit-list__word-box--remove"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWord(index);
                  }}
                >
                  ×
                </button>
              </div>
              <hr className="edit-list__word-box--divider" />

              <div className="edit-list__word-box--row">
                <div className="edit-list__word-box--field">
                  <AccountPageInput
                    type="text"
                    name={`term-${index}`}
                    value={word.term || ""}
                    onChange={(e) => onWordChange(index, "term", e.target.value)}
                  />
                  <small className="input-title">Terminology</small>
                </div>

                <div className="edit-list__word-box--field">
                  <AccountPageInput
                    type="text"
                    name={`definition-${index}`}
                    value={word.definition || ""}
                    onChange={(e) => onWordChange(index, "definition", e.target.value)}
                  />
                  <small className="input-title">Definition</small>
                </div>

                <div className="edit-list__word-box--field">
                  <AccountPageInput
                    type="text"
                    name={`phonetics-${index}`}
                    value={word.phonetics || ""}
                    onChange={(e) => onWordChange(index, "phonetics", e.target.value)}
                  />
                  <small className="input-title">Phonetics</small>
                </div>
              </div>

              <div className="create-list__word-box--row">
                <div className="create-list__word-box--field">
                  <AccountPageInput
                    name={`synonyms-${index}`}
                    type="text"
                    placeholder=""
                    value={word.synonyms}
                    onChange={(e) => onWordChange(index, "synonyms", e.target.value)}
                  />
                  <small className="input-title">Synonyms</small>
                </div>

                <div className="create-list__word-box--field">
                  <AccountPageInput
                    name={`translation-${index}`}
                    type="text"
                    placeholder=""
                    value={word.translation}
                    onChange={(e) => onWordChange(index, "translation", e.target.value)}
                  />
                  <small className="input-title">Translation</small>
                </div>
              </div>

              <div className="create-list__word-box--row">
                <div className="create-list__word-box--field">
                  <AccountPageInput
                    name={`exampleSentence-${index}`}
                    type="text"
                    placeholder=""
                    value={word.exampleSentence}
                    onChange={(e) => onWordChange(index, "exampleSentence", e.target.value)}
                  />
                  <small className="input-title">An example in context</small>
                </div>
                <button 
                  type="button" 
                  className="create-list__ai-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onGenerateExample(index);
                  }}
                  disabled={loadingAI.has(index)}
                >
                  {loadingAI.has(index) ? "Generating..." : "AI"}
                </button>
              </div>
            </div>
          );
        })}
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