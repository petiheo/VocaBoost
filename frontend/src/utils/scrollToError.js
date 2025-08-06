/**
 * Scrolls to the first validation error on the page
 * @param {Object} validationErrors - The validation errors object
 * @param {string} formPrefix - The CSS class prefix for the form (e.g., 'create-list', 'edit-list')
 */
export const scrollToFirstError = (validationErrors, formPrefix = 'create-list') => {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return;
  }

  // Priority order: title, description, then words
  const errorPriority = ['title', 'description', 'words'];
  
  for (const errorType of errorPriority) {
    if (validationErrors[errorType]) {
      if (errorType === 'words') {
        // For word errors, find the first word with errors
        const wordErrors = validationErrors.words;
        const firstErrorWordIndex = Object.keys(wordErrors)
          .map(Number)
          .sort((a, b) => a - b)[0];
        
        if (firstErrorWordIndex !== undefined) {
          scrollToWordError(firstErrorWordIndex, formPrefix);
          return;
        }
      } else {
        // For title/description errors
        scrollToFieldError(errorType, formPrefix);
        return;
      }
    }
  }
};

/**
 * Scrolls to a specific field error
 * @param {string} fieldName - The field name (title, description)
 * @param {string} formPrefix - The CSS class prefix for the form
 */
const scrollToFieldError = (fieldName, formPrefix) => {
  // Try multiple selector patterns
  const selectors = [
    `[name="${fieldName}"]`,
    `[name="list-${fieldName}"]`, // For list-title field
    `.${formPrefix}__form--${fieldName}`,
    `input[name="${fieldName}"]`,
    `textarea[name="${fieldName}"]`,
    `input[name="list-${fieldName}"]`,
    `textarea[name="list-${fieldName}"]`,
    `#${fieldName}`,
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      scrollToElement(element);
      return;
    }
  }
  
  console.warn(`Could not find element for field: ${fieldName}`);
};

/**
 * Scrolls to a specific word error
 * @param {number} wordIndex - The index of the word with error
 * @param {string} formPrefix - The CSS class prefix for the form
 */
const scrollToWordError = (wordIndex, formPrefix) => {
  // Try multiple selector patterns for word boxes
  const selectors = [
    `.${formPrefix}__word-box:nth-child(${wordIndex + 1})`,
    `[data-word-index="${wordIndex}"]`,
    `input[name="term-${wordIndex}"]`,
    `input[name="definition-${wordIndex}"]`,
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // For input elements, scroll to the parent word box if available
      const wordBox = element.closest(`.${formPrefix}__word-box`);
      scrollToElement(wordBox || element);
      
      // Also focus the first input in the word box for better UX
      const firstInput = (wordBox || element).querySelector('input, textarea');
      if (firstInput && firstInput.focus) {
        setTimeout(() => firstInput.focus(), 100);
      }
      return;
    }
  }
  
  console.warn(`Could not find element for word at index: ${wordIndex}`);
};

/**
 * Smoothly scrolls to an element with proper offset
 * @param {HTMLElement} element - The element to scroll to
 */
const scrollToElement = (element) => {
  if (!element) return;

  // Tính offset để tránh che bởi header
  const headerOffset = 100; // Chỉnh theo height của header 
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  // Smooth scroll to the element
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });

  // Add a subtle highlight effect
  element.style.transition = 'box-shadow 0.3s ease';
  element.style.boxShadow = '0 0 10px rgba(255, 193, 7, 0.5)';
  
  // Remove highlight after animation
  setTimeout(() => {
    element.style.boxShadow = '';
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
  }, 2000);
};

/**
 * Scrolls to a specific element by selector
 * @param {string} selector - CSS selector for the element
 * @param {number} offset - Optional offset from top (default: 100px)
 */
const scrollToSelector = (selector, offset = 100) => {
  const element = document.querySelector(selector);
  if (element) {
    scrollToElement(element);
  }
};

// Export all functions
export { scrollToSelector };
export default scrollToFirstError;