/**
 * Standardized error handling for authentication flows
 */

export const getAuthErrorMessage = (error) => {
  // Check if it's an axios error with response data
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for common HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Invalid credentials. Please check your email and password.";
      case 403:
        return "Access denied. Your account may be suspended.";
      case 404:
        return "Service not found. Please try again later.";
      case 409:
        return "Email already exists. Please use a different email or sign in.";
      case 422:
        return "Invalid data provided. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  // Network errors
  if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
    return "Network error. Please check your connection and try again.";
  }

  // Timeout errors
  if (error.code === "ECONNABORTED") {
    return "Request timeout. Please try again.";
  }

  // Default fallback
  return error.message || "An unexpected error occurred. Please try again.";
};

export const handleAuthError = (error, setErrors, clearForm = null) => {
  const errorMessage = getAuthErrorMessage(error);

  // Set the error state
  setErrors({ general: errorMessage });

  // Clear form if function provided
  if (clearForm && typeof clearForm === "function") {
    clearForm();
  }

  // Log error for debugging (only in development)
  if (import.meta.env.MODE === "development") {
    console.error("Auth Error:", error);
  }
};

export const clearAuthErrors = (setErrors) => {
  setErrors({});
};

// Specific error handlers for common auth scenarios
export const handleLoginError = (error, setErrors, clearForm) => {
  const errorMessage = getAuthErrorMessage(error);

  // For login, we typically show errors on the password field
  setErrors({ login: errorMessage });

  if (clearForm) {
    clearForm();
  }
};

export const handleSignupError = (error, setErrors, clearForm) => {
  const errorMessage = getAuthErrorMessage(error);

  // For signup, check if it's an email conflict
  if (error.response?.status === 409) {
    setErrors({
      email:
        "This email is already registered. Please use a different email or sign in.",
    });
  } else {
    setErrors({ general: errorMessage });
  }

  if (clearForm) {
    clearForm();
  }
};

export const handlePasswordResetError = (error, setErrors) => {
  const errorMessage = getAuthErrorMessage(error);
  setErrors({ general: errorMessage });
};
