import React, { useState, useEffect, useId } from 'react';
import Modal from 'react-modal';
import { useToast } from '../Providers/ToastProvider.jsx';

// Set app element for accessibility only once
if (typeof window !== 'undefined' && !Modal.defaultProps?.appElement) {
  try {
    Modal.setAppElement(document.getElementById('root') || document.body);
  } catch (error) {
    console.warn('React Modal setAppElement warning:', error);
  }
}

const Report = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const toast = useToast();
  const modalId = useId(); // Unique identifier for this modal instance

  // Cleanup function to restore body styles
  const cleanupBodyStyles = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  };

  const handleSubmit = () => {
    if (description.trim()) {
      if (description.length < 5) {
        toast('Description must be at least 5 characters long.', 'warning');
        return;
      }
      
      try {
        cleanupBodyStyles(); // Clean up before closing
        onSubmit(description);
        setDescription('');
        onClose();
      } catch (error) {
        console.error('Error during submit:', error);
        cleanupBodyStyles();
        onClose();
      }
    } else {
      toast('Please enter a description before submitting.', 'warning');
    }
  };

  const handleClose = () => {
    try {
      cleanupBodyStyles(); // Clean up before closing
      onClose();
    } catch (error) {
      console.error('Error during close:', error);
      cleanupBodyStyles();
    }
  };

  const handleRequestClose = () => {
    // This is called when user tries to close modal (ESC, click outside, etc.)
    // We want to prevent auto-close and show feedback instead
    
    // Trigger shake animation
    setIsShaking(true);
    
    // Show toast notification
    toast('Please close the report dialog to continue', 'warning');
    
    // Remove shake animation after it completes
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleOverlayClick = (e) => {
    // Handle manual overlay click detection
    if (e.target.classList.contains('ReactModal__Overlay')) {
      handleRequestClose();
    }
  };

  // Prevent all events from bubbling through modal content
  const handleModalContentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleModalContentKeyDown = (e) => {
    // Allow normal typing in textarea and form interactions
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
      // Allow normal interactions within modal
      if (e.key === 'Escape') {
        handleClose();
      }
      return;
    }
    
    // For other elements, prevent propagation
    e.preventDefault();
    e.stopPropagation();
  };

  const handleKeyDown = (e) => {
    // Only allow ESC to close, block all other shortcuts
    if (e.key === 'Escape') {
      handleClose();
    } else {
      // Prevent all other keyboard shortcuts from working
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    // Store original body styles
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
    };

    // Apply blocking styles
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Add event listeners with high priority (capture phase)
    const handleKeyCapture = (e) => {
      // Completely block all keyboard events except those within modal
      if (!e.target.closest('.report-modal-content')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Allow ESC and Tab within modal for accessibility
      if (e.key === 'Escape') {
        handleClose();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleClickCapture = (e) => {
      // Block all clicks outside modal content
      if (!e.target.closest('.report-modal-content')) {
        e.preventDefault();
        e.stopPropagation();
        handleRequestClose();
        return false;
      }
    };

    const handleMouseCapture = (e) => {
      // Block all mouse events outside modal
      if (!e.target.closest('.report-modal-content')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleTouchCapture = (e) => {
      // Block touch events outside modal (for mobile)
      if (!e.target.closest('.report-modal-content')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Use capture phase to intercept events before they reach other elements
    document.addEventListener('keydown', handleKeyCapture, { capture: true });
    document.addEventListener('keyup', handleKeyCapture, { capture: true });
    document.addEventListener('click', handleClickCapture, { capture: true });
    document.addEventListener('mousedown', handleMouseCapture, { capture: true });
    document.addEventListener('mouseup', handleMouseCapture, { capture: true });
    document.addEventListener('touchstart', handleTouchCapture, { capture: true });
    document.addEventListener('touchend', handleTouchCapture, { capture: true });
    document.addEventListener('wheel', handleMouseCapture, { capture: true, passive: false });
    document.addEventListener('contextmenu', handleMouseCapture, { capture: true });
    
    return () => {
      // Restore original body styles
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.height = originalBodyStyle.height;

      // Remove event listeners
      document.removeEventListener('keydown', handleKeyCapture, { capture: true });
      document.removeEventListener('keyup', handleKeyCapture, { capture: true });
      document.removeEventListener('click', handleClickCapture, { capture: true });
      document.removeEventListener('mousedown', handleMouseCapture, { capture: true });
      document.removeEventListener('mouseup', handleMouseCapture, { capture: true });
      document.removeEventListener('touchstart', handleTouchCapture, { capture: true });
      document.removeEventListener('touchend', handleTouchCapture, { capture: true });
      document.removeEventListener('wheel', handleMouseCapture, { capture: true });
      document.removeEventListener('contextmenu', handleMouseCapture, { capture: true });
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
        console.error('Error during component cleanup:', error);
      }
    };
  }, []);

  // Custom styles for React Modal
  const modalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for more emphasis
      backdropFilter: 'blur(3px)',
      zIndex: 9999, // Higher z-index to ensure it's on top
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'not-allowed', // Show that clicking is not allowed
    },
    content: {
      position: 'static',
      inset: 'auto',
      border: 'none',
      background: '#faf3e0',
      overflow: 'visible',
      borderRadius: '20px',
      outline: 'none',
      padding: '40px',
      maxWidth: '550px',
      width: '90%',
      maxHeight: '90vh',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', // Stronger shadow
      fontFamily: "'Inria Sans', serif",
      cursor: 'default', // Normal cursor inside modal
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleRequestClose}
      style={modalStyles}
      closeTimeoutMS={300}
      shouldCloseOnOverlayClick={false} // Disable built-in overlay click
      shouldCloseOnEsc={false} // Disable built-in ESC, we handle manually
      shouldFocusAfterRender={true}
      shouldReturnFocusAfterClose={true}
      contentLabel={`Report Modal ${modalId}`} // Unique label
      portalClassName={`report-modal-portal-${modalId.replace(/:/g, '-')}`} // Unique portal class
      overlayElement={(props, contentElement) => (
        <div {...props} onClick={handleOverlayClick}>
          {contentElement}
        </div>
      )}
    >
      <div 
        className={`report-modal-content ${isShaking ? 'shake-animation' : ''}`}
        onClick={handleModalContentClick}
        onKeyDown={handleModalContentKeyDown}
        onMouseDown={handleModalContentClick}
        onTouchStart={handleModalContentClick}
      >
        <button className="close-button" onClick={handleClose}>×</button>
        <h2 className="report-title">REPORT</h2>
        <p className="report-instruction">Please provide more detail about the issues</p>
        <textarea
          className="report-textarea"
          placeholder="Enter the description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            // Allow normal typing in textarea
            if (e.key === 'Escape') {
              handleClose();
            }
            // Don't prevent other keys for normal typing
          }}
        />
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </Modal>
  );
};

export default Report;
