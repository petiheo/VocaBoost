# Components Architecture

This folder contains all reusable React components organized by feature domain and functionality.

## 📁 Folder Structure

### **Layout**

Core page layout and navigation components:

- `Header.jsx` - Main application header with navigation
- `Footer.jsx` - Application footer
- `SideBar.jsx` - Main navigation sidebar
- `NavBar.jsx` - Navigation bar component
- `Logo.jsx` - Application logo component

### **Forms**

Input components and form elements:

- `AccountPageInput.jsx` - Account page input fields
- `CreateListInput.jsx` - Vocabulary list creation inputs
- `WordInput.jsx` - Word input component
- `SearchBar.jsx` - Search functionality component

### **Vocabulary**

Vocabulary-specific feature components:

- `CarouselVocabSection.jsx` - Vocabulary carousel display
- `WordCard.jsx` - Individual word card component
- `WordsSection.jsx` - Words list section container
- `ListMetadataForm.jsx` - List metadata form

### **Classroom**

Classroom management and functionality:

- `ClassroomDropdownMenu.jsx` - Classroom dropdown menu
- `ClassroomTitle.jsx` - Classroom title component
- `SeeMoreSection.jsx` - See more section for classrooms
- `TeacherClassroomMenuTab.jsx` - Teacher classroom menu tabs
- `VocabularyListCard.jsx` - Vocabulary list card display

### **Navigation**

Menu and navigation specific components:

- `LearnerSubMenu.jsx` - Learner navigation submenu
- `DropdownMenu.jsx` - Generic dropdown menu component

### **UI**

Generic UI elements and components:

- `ConfirmModal.jsx` - Confirmation modal dialog
- `ToastNotification.jsx` - Toast notification component
- `cursor/LoadingCursor.jsx` - Loading cursor component

### **Providers**

Context providers and global state management:

- `ConfirmProvider.jsx` - Confirmation context provider
- `ToastProvider.jsx` - Toast notification provider
- `ErrorBoundary.jsx` - Error boundary component

### **Reporting**

Reporting and analytics components:

- `Report.jsx` - Report component
- `ReportTrigger.jsx` - Report trigger component

### **Profile**

User profile related components:

- `ProfileComponents.jsx` - Profile-related components

## 🔗 Usage

All components are exported through the main `index.jsx` file for easy importing:

```javascript
// Import layout components
import { Header, Footer, SideBar } from "components";

// Import form components
import { SearchBar, AccountPageInput } from "components";

// Import providers
import { useToast, useConfirm } from "components";

// Import vocabulary components
import { WordCard, WordsSection } from "components";
```
