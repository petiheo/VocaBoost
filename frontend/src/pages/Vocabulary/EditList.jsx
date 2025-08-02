import React from "react";
import { useParams } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components/index.jsx";
import ListMetadataForm from "../../components/Vocabulary/ListMetadataForm.jsx";
import EditWordsSection from "../../components/Vocabulary/EditWordsSection.jsx";
import SafeEditList from "../../components/SafeEditList.jsx";
import { useEditWordManagement } from "../../hooks/useEditWordManagement.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useEditListManagement } from "../../hooks/useEditListManagement.js";
export default function EditList() {
  const { listId } = useParams();
  
  // Custom hooks for separated concerns
  const validationHook = useFormValidation();
  const wordManagementHook = useEditWordManagement();
  const listManagementHook = useEditListManagement(listId, validationHook, wordManagementHook);
  
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="edit-list">
        <Header />
        <div className="edit-list__content">
          <SideBar />
          <div className="edit-list__loading">Loading...</div>
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
          <SideBar />
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
              onWordChange={handleWordChange}
              onDeleteWord={deleteWord}
              onToggleWordSelection={toggleWordSelection}
              onGenerateExample={generateExample}
              onDeleteSelectedWords={deleteSelectedWords}
              onAddWord={addWord}
            />

            <div className="edit-list__actions">
              <input
                type="button"
                value="Cancel"
                className="edit-list__form--cancel"
                onClick={handleCancel}
              />
              <input
                type="submit"
                value="Save Changes"
                className="edit-list__form--submit"
              />
            </div>
          </form>
        </div>
        <Footer />
      </div>
    </SafeEditList>
  );
}
