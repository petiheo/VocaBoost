import { useState, useCallback } from "react";

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const clearFieldError = useCallback(
    (field, subfield = null, index = null) => {
      setValidationErrors((prev) => {
        if (subfield && index !== null) {
          // For nested errors like words[index][field]
          return {
            ...prev,
            [field]: {
              ...prev[field],
              [index]: {
                ...prev[field]?.[index],
                [subfield]: undefined,
              },
            },
          };
        } else {
          // For simple field errors
          return {
            ...prev,
            [field]: undefined,
          };
        }
      });
    },
    []
  );

  const setErrors = useCallback((errors) => {
    setValidationErrors(errors);
  }, []);

  const hasErrors = useCallback(() => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  return {
    validationErrors,
    setErrors,
    clearFieldError,
    hasErrors,
  };
};
