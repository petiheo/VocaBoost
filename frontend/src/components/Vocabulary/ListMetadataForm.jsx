import React from "react";
import Select from "react-select";
import CreateListInput from "../Forms/CreateListInput.jsx";
import { PRIVACY_OPTIONS } from "../../constants/vocabulary.js";

const ListMetadataForm = ({
  title,
  description,
  privacy,
  selectedTags,
  availableTags,
  validationErrors,
  onTitleChange,
  onDescriptionChange,
  onPrivacyChange,
  onTagsChange,
}) => {
  return (
    <>
      <CreateListInput
        label="Title"
        name="list-title"
        as="textarea"
        value={title}
        onChange={onTitleChange}
        placeholder="Enter a title - For example, 'Intro to SE - chapter 5'"
        required={true}
        errors={validationErrors.title}
        className="create-list__form--title"
      />

      <CreateListInput
        label="Description"
        name="description"
        as="textarea"
        value={description}
        onChange={onDescriptionChange}
        placeholder="Description:..."
        required={false}
        errors={validationErrors.description}
        className="create-list__form--description"
      />

      <div className="create-list__privacy-section">
        <label className="create-list__sub-header">Privacy:</label>
        <div className="create-list__privacy-section--buttons">
          {PRIVACY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`create-list__privacy-button ${
                privacy === option ? "active" : ""
              }`}
              onClick={() => onPrivacyChange(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Select
        options={availableTags.map((tag) => ({ value: tag, label: tag }))}
        isMulti
        placeholder="Choose tags"
        value={selectedTags.map((tag) => ({ value: tag, label: tag }))}
        onChange={(selectedOptions) =>
          onTagsChange(selectedOptions.map((opt) => opt.value))
        }
      />
    </>
  );
};

export default ListMetadataForm;
