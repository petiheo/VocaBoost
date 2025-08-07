import React from "react";
import WordInput from "../Forms/WordInput.jsx";

const WordCard = ({
  word,
  index,
  isSelected,
  isGeneratingExample,
  validationErrors,
  onWordChange,
  onDelete,
  onToggleSelect,
  onGenerateExample,
  classPrefix = "create-list",
}) => {
  const handleCardClick = (e) => {
    // Prevent selection when clicking on interactive elements
    if (
      e.target.tagName !== "INPUT" &&
      e.target.tagName !== "BUTTON" &&
      e.target.tagName !== "TEXTAREA" &&
      e.target.tagName !== "SELECT" &&
      !e.target.closest("label")
    ) {
      onToggleSelect(index);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(index);
  };

  return (
    <div
      className={`${classPrefix}__word-box ${
        isSelected ? `${classPrefix}__word-box--selected` : ""
      }`}
      onClick={handleCardClick}
      data-word-index={index}
    >
      <div className={`${classPrefix}__word-box--header`}>
        <div className={`${classPrefix}__word-box--index`}>{index + 1}</div>
        <button
          className={`${classPrefix}__word-box--remove`}
          type="button"
          onClick={handleDeleteClick}
        >
          ×
        </button>
      </div>

      <hr className={`${classPrefix}__word-box--divider`} />

      {/* First Row */}
      <div className={`${classPrefix}__word-box--row`}>
        <div className={`${classPrefix}__word-box--field`}>
          <WordInput
            label="Term"
            name={`term-${index}`}
            type="text"
            placeholder="Enter the term"
            value={word.term || ""}
            onChange={(e) => onWordChange(index, "term", e.target.value)}
            required={true}
            errors={validationErrors?.words?.[index]?.term}
            classPrefix={classPrefix}
          />
        </div>

        <div className={`${classPrefix}__word-box--field`}>
          <WordInput
            label="Definition"
            name={`definition-${index}`}
            type="text"
            placeholder="Enter the definition"
            value={word.definition || ""}
            onChange={(e) => onWordChange(index, "definition", e.target.value)}
            required={true}
            errors={validationErrors?.words?.[index]?.definition}
            classPrefix={classPrefix}
          />
        </div>

        <div className={`${classPrefix}__word-box--field`}>
          <WordInput
            label="Phonetics"
            name={`phonetics-${index}`}
            type="text"
            placeholder="Enter phonetics (optional)"
            value={word.phonetics || ""}
            onChange={(e) => onWordChange(index, "phonetics", e.target.value)}
            required={false}
            errors={validationErrors?.words?.[index]?.phonetics}
            classPrefix={classPrefix}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className={`${classPrefix}__word-box--row`}>
        <div className={`${classPrefix}__word-box--field`}>
          <WordInput
            label="Synonyms"
            name={`synonyms-${index}`}
            type="text"
            placeholder="Enter synonyms separated by commas (optional)"
            value={word.synonyms || ""}
            onChange={(e) => onWordChange(index, "synonyms", e.target.value)}
            required={false}
            errors={validationErrors?.words?.[index]?.synonyms}
            classPrefix={classPrefix}
          />
        </div>

        <div className={`${classPrefix}__word-box--field`}>
          <WordInput
            label="Translation"
            name={`translation-${index}`}
            type="text"
            placeholder="Enter translation (optional)"
            value={word.translation || ""}
            onChange={(e) => onWordChange(index, "translation", e.target.value)}
            required={false}
            errors={validationErrors?.words?.[index]?.translation}
            classPrefix={classPrefix}
          />
        </div>
      </div>

      {/* Third Row - Example with AI button */}
      <div className={`${classPrefix}__word-box--ai`}>
        <div className={`${classPrefix}__word-box--field`}>
          <WordInput
            label="Example sentence"
            name={`exampleSentence-${index}`}
            type="text"
            placeholder="Enter an example sentence (optional)"
            value={word.exampleSentence || ""}
            onChange={(e) =>
              onWordChange(index, "exampleSentence", e.target.value)
            }
            required={false}
            errors={validationErrors?.words?.[index]?.exampleSentence}
            classPrefix={classPrefix}
          />
        </div>
        <button
          type="button"
          className={`${classPrefix}__ai-btn`}
          onClick={() => onGenerateExample(index)}
          disabled={isGeneratingExample}
        >
          {isGeneratingExample ? "Generating..." : "AI"}
        </button>
      </div>
    </div>
  );
};

export default WordCard;
