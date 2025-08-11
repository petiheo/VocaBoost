import { useEffect, useId, useState } from "react";
import Modal from "react-modal";

// Set app element for accessibility only once
if (typeof window !== "undefined" && !Modal.defaultProps?.appElement) {
  try {
    Modal.setAppElement(document.getElementById("root") || document.body);
  } catch (error) {
    console.warn("React Modal setAppElement warning:", error);
  }
}

export const useModal = (onClose, options = {}) => {
  const [isShaking, setIsShaking] = useState(false);
  const modalId = useId();
  const { blockInteractions = true } = options;

  // Cleanup function to restore body styles
  const cleanupBodyStyles = () => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.height = "";
  };

  const handleClose = () => {
    try {
      cleanupBodyStyles();
      onClose();
    } catch (error) {
      console.error("Error during close:", error);
      cleanupBodyStyles();
    }
  };

  const handleRequestClose = (showShake = true) => {
    if (showShake) {
      // Trigger shake animation
      setIsShaking(true);

      // Remove shake animation after it completes
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    } else {
      handleClose();
    }
  };

  const handleOverlayClick = (e) => {
    // Handle manual overlay click detection
    if (e.target === e.currentTarget) {
      handleRequestClose();
    }
  };

  // Prevent all events from bubbling through modal content
  const handleModalContentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleModalContentKeyDown = (e) => {
    // Allow normal typing and interactions
    if (
      e.target.tagName === "TEXTAREA" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "INPUT"
    ) {
      if (e.key === "Escape") {
        handleClose();
      }
      return;
    }

    // For other elements, prevent propagation
    e.preventDefault();
    e.stopPropagation();
  };

  // Global event handlers
  useEffect(() => {
    // Store original body styles
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
    };

    // Apply blocking styles
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    // Add event listeners with high priority (capture phase)
    const handleKeyCapture = (e) => {
      // Completely block all keyboard events except those within modal
      if (!e.target.closest(".modal-content")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Allow ESC and Tab within modal for accessibility
      if (e.key === "Escape") {
        handleClose();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleClickCapture = (e) => {
      // Block all clicks outside modal content
      if (!e.target.closest(".modal-content")) {
        e.preventDefault();
        e.stopPropagation();
        handleRequestClose();
        return false;
      }
    };

    const handleMouseCapture = (e) => {
      // Block all mouse events outside modal
      if (!e.target.closest(".modal-content")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleTouchCapture = (e) => {
      // Block touch events outside modal (for mobile)
      if (!e.target.closest(".modal-content")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Use capture phase to intercept events before they reach other elements
    if (blockInteractions) {
      document.addEventListener("keydown", handleKeyCapture, { capture: true });
      document.addEventListener("keyup", handleKeyCapture, { capture: true });
      document.addEventListener("click", handleClickCapture, { capture: true });
      document.addEventListener("mousedown", handleMouseCapture, {
        capture: true,
      });
      document.addEventListener("mouseup", handleMouseCapture, {
        capture: true,
      });
      document.addEventListener("touchstart", handleTouchCapture, {
        capture: true,
      });
      document.addEventListener("touchend", handleTouchCapture, {
        capture: true,
      });
      document.addEventListener("wheel", handleMouseCapture, {
        capture: true,
        passive: false,
      });
      document.addEventListener("contextmenu", handleMouseCapture, {
        capture: true,
      });
    }

    return () => {
      // Restore original body styles
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.height = originalBodyStyle.height;

      // Remove event listeners
      if (blockInteractions) {
        document.removeEventListener("keydown", handleKeyCapture, {
          capture: true,
        });
        document.removeEventListener("keyup", handleKeyCapture, {
          capture: true,
        });
        document.removeEventListener("click", handleClickCapture, {
          capture: true,
        });
        document.removeEventListener("mousedown", handleMouseCapture, {
          capture: true,
        });
        document.removeEventListener("mouseup", handleMouseCapture, {
          capture: true,
        });
        document.removeEventListener("touchstart", handleTouchCapture, {
          capture: true,
        });
        document.removeEventListener("touchend", handleTouchCapture, {
          capture: true,
        });
        document.removeEventListener("wheel", handleMouseCapture, {
          capture: true,
        });
        document.removeEventListener("contextmenu", handleMouseCapture, {
          capture: true,
        });
      }
    };
  }, []);

  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      try {
        cleanupBodyStyles();
        // Reset any global modal state if needed
        if (window.isModalOpen) {
          window.isModalOpen = false;
        }
      } catch (error) {
        console.error("Error during component cleanup:", error);
      }
    };
  }, []);

  const getModalStyles = (customStyles = {}) => ({
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(3px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "not-allowed",
      ...customStyles.overlay,
    },
    content: {
      position: "static",
      inset: "auto",
      border: "none",
      background: "#faf3e0",
      overflow: "visible",
      borderRadius: "20px",
      outline: "none",
      padding: "40px",
      maxWidth: "550px",
      width: "90%",
      maxHeight: "90vh",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      fontFamily: "'Inria Sans', serif",
      cursor: "default",
      ...customStyles.content,
    },
  });

  const getModalProps = (customStyles = {}) => ({
    isOpen: true,
    onRequestClose: () => handleRequestClose(false),
    style: getModalStyles(customStyles),
    closeTimeoutMS: 300,
    shouldCloseOnOverlayClick: false,
    shouldCloseOnEsc: false,
    shouldFocusAfterRender: true,
    shouldReturnFocusAfterClose: true,
    contentLabel: `Modal ${modalId}`,
    portalClassName: `modal-portal-${modalId.replace(/:/g, "-")}`,
  });

  const getContentProps = () => {
    if (blockInteractions) {
      return {
        className: `modal-content ${isShaking ? "shake-animation" : ""}`,
        onClick: handleModalContentClick,
        onKeyDown: handleModalContentKeyDown,
        onMouseDown: handleModalContentClick,
        onTouchStart: handleModalContentClick,
      };
    } else {
      return {
        className: `modal-content ${isShaking ? "shake-animation" : ""}`,
        onClick: (e) => e.stopPropagation(), // Only stop propagation, don't prevent default
      };
    }
  };

  const getOverlayProps = () => ({
    onClick: handleOverlayClick,
  });

  return {
    modalId,
    isShaking,
    handleClose,
    handleRequestClose,
    getModalProps,
    getContentProps,
    getOverlayProps,
    getModalStyles,
  };
};
