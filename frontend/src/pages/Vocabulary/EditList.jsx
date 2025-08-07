import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Footer,
  Header,
  ListFormSkeleton,
  SideBar,
} from "../../components/index.jsx";
import EditWordsSection from "../../components/Vocabulary/EditWordsSection.jsx";
import ListMetadataForm from "../../components/Vocabulary/ListMetadataForm.jsx";
import SafeEditList from "../../components/Vocabulary/SafeEditList.jsx";
import { useEditListManagement } from "../../hooks/useEditListManagement.js";
import { useEditWordManagement } from "../../hooks/useEditWordManagement.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
export default function EditList() {
  const { listId } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  // Custom hooks for separated concerns
  const validationHook = useFormValidation();
  const wordManagementHook = useEditWordManagement();
  const listManagementHook = useEditListManagement(
    listId,
    validationHook,
    wordManagementHook
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
    isLoading,
    isSubmitting,
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
    clearFieldError("words", field, index);
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="edit-list">
        <Header />
        <div className="edit-list__content">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <ListFormSkeleton isEditMode={true} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <SafeEditList>
      <div className="edit-list">
        <Header />
        <div className="edit-list__content">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <form className="edit-list__form" onSubmit={handleSubmit}>
            <h1 className="edit-list__header">Edit List</h1>

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
              isEditMode={true}
            />

            <EditWordsSection
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

            <div className="edit-list__actions">
              <button
                type="button"
                className="edit-list__form--cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`edit-list__form--submit ${isSubmitting ? "edit-list__form--submit--loading" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
        <Footer />
      </div>
    </SafeEditList>
  );
}
