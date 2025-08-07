import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Footer,
  Header,
  ListFormSkeleton,
  SideBar,
} from "../../components/index.jsx";
import ListMetadataForm from "../../components/Vocabulary/ListMetadataForm.jsx";
import WordsSection from "../../components/Vocabulary/WordsSection.jsx";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useListManagement } from "../../hooks/useListManagement.js";
import { useWordManagement } from "../../hooks/useWordManagement.js";

export default function CreateList() {
  const { listId } = useParams();
  const isNewList = listId === "new";
  const actualListId = isNewList ? null : listId;
  const [isOpen, setIsOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Custom hooks for separated concerns
  const validationHook = useFormValidation();
  const wordManagementHook = useWordManagement();
  const listManagementHook = useListManagement(
    actualListId,
    validationHook,
    wordManagementHook,
    isNewList
  );

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
    isSubmitting,
  } = listManagementHook;

  // Simulate initial loading for tags/setup
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced word change handler with validation clearing
  const handleWordChange = (index, field, value) => {
    updateWord(index, field, value);
    clearFieldError("words", field, index);
  };

  if (initialLoading) {
    return (
      <div className="create-list">
        <Header />
        <div className="create-list__content">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <ListFormSkeleton isEditMode={false} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="create-list">
      <Header />
      <div className="create-list__content">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <form className="create-list__form" onSubmit={handleSubmit}>
          <h1 className="create-list__header">Create List</h1>

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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={`create-list__form--submit ${isSubmitting ? "create-list__form--submit--loading" : ""}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create List"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
