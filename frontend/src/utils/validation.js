// Client-side validation utilities for profile forms

export const validateDisplayName = (displayName) => {
  const errors = [];
  
  if (!displayName || displayName.trim().length === 0) {
    errors.push("Display name is required");
    return errors;
  }
  
  const trimmed = displayName.trim();
  
  // Check length
  if (trimmed.length < 2) {
    errors.push("Display name must be at least 2 characters long");
  }
  
  if (trimmed.length > 50) {
    errors.push("Display name must be less than 50 characters");
  }
  
  // Check for invalid characters (only letters, numbers, spaces, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validPattern.test(trimmed)) {
    errors.push("Display name contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores are allowed");
  }
  
  // Check for consecutive spaces
  if (/\s{2,}/.test(trimmed)) {
    errors.push("Display name cannot contain consecutive spaces");
  }
  
  // Check if starts or ends with space
  if (trimmed !== displayName.trim()) {
    errors.push("Display name cannot start or end with spaces");
  }
  
  return errors;
};

export const validateDailyGoal = (dailyGoal) => {
  const errors = [];
  
  if (dailyGoal === "" || dailyGoal === null || dailyGoal === undefined) {
    return errors; // Daily goal is optional
  }
  
  const numValue = parseInt(dailyGoal);
  
  if (isNaN(numValue)) {
    errors.push("Daily goal must be a valid number");
    return errors;
  }
  
  if (numValue < 1) {
    errors.push("Daily goal must be at least 1");
  }
  
  if (numValue > 1000) {
    errors.push("Daily goal cannot exceed 1000");
  }
  
  return errors;
};

export const validateAvatarFile = (file) => {
  const errors = [];
  
  if (!file) {
    return errors; // Avatar is optional
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push("Avatar must be an image file (JPEG, PNG, GIF, or WebP)");
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push("Avatar file size must be less than 5MB");
  }
  
  return errors;
};

// Validate all profile fields
export const validateProfile = (formData) => {
  const errors = {};
  
  const displayNameErrors = validateDisplayName(formData.displayName);
  if (displayNameErrors.length > 0) {
    errors.displayName = displayNameErrors;
  }
  
  const dailyGoalErrors = validateDailyGoal(formData.dailyGoal);
  if (dailyGoalErrors.length > 0) {
    errors.dailyGoal = dailyGoalErrors;
  }
  
  const avatarErrors = validateAvatarFile(formData.avatarFile);
  if (avatarErrors.length > 0) {
    errors.avatar = avatarErrors;
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};