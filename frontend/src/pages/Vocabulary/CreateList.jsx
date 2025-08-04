import { useState} from "react";
import { useParams } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components/index.jsx";
import ListMetadataForm from "../../components/Vocabulary/ListMetadataForm.jsx";
import WordsSection from "../../components/Vocabulary/WordsSection.jsx";
import { useWordManagement } from "../../hooks/useWordManagement.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useListManagement } from "../../hooks/useListManagement.js";

export default function CreateList() {
  const { listId } = useParams();
  const isNewList = listId === 'new';
  const actualListId = isNewList ? null : listId;
  const [isOpen, setIsOpen] = useState(false);
  
  // Custom hooks for separated concerns
  const validationHook = useFormValidation();
  const wordManagementHook = useWordManagement();
  const listManagementHook = useListManagement(actualListId, validationHook, wordManagementHook, isNewList);
  
  // Destructure hook returns for cleaner component
  const { validationErrors, clearFieldError } = validationHook;
  const {
    words,
    selectedWordIds,
    loadingAI,
    addWord,
    deleteWord,
    deleteSelectedWords,
    updateWord,
    toggleWordSelection,
    generateExample,
  } = wordManagementHook;
  const {
    title,
    description,
    privacy,
    selectedTags,
    availableTags,
    handleTitleChange,
    handleDescriptionChange,
    handleSubmit,
    handleCancel,
    setPrivacy,
    setSelectedTags,
  } = listManagementHook;

  // Enhanced word change handler with validation clearing
  const handleWordChange = (index, field, value) => {
    updateWord(index, field, value);
    clearFieldError('words', field, index);
  };

  return (
    <div className="create-list">
      <Header />
      <div className="create-list__content">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <form className="create-list__form" onSubmit={handleSubmit}>
          <ListMetadataForm
            title={title}
            description={description}
            privacy={privacy}
            selectedTags={selectedTags}
            availableTags={availableTags}
            validationErrors={validationErrors}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onPrivacyChange={setPrivacy}
            onTagsChange={setSelectedTags}
          />

          <WordsSection
            words={words}
            selectedWordIds={selectedWordIds}
            loadingAI={loadingAI}
            validationErrors={validationErrors}
            onWordChange={handleWordChange}
            onDeleteWord={deleteWord}
            onToggleWordSelection={toggleWordSelection}
            onGenerateExample={generateExample}
            onDeleteSelectedWords={deleteSelectedWords}
            onAddWord={addWord}
          />

          <div className="create-list__actions">
            <button
              type="button"
              className="create-list__form--cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <input
              className="create-list__form--submit"
              type="submit"
              value="Create List"
            />
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
