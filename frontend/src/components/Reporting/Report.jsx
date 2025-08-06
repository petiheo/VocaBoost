import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useToast } from '../Providers/ToastProvider.jsx';

// Set app element for accessibility (usually done in main App.js, but we'll do it here)
if (typeof window !== 'undefined') {
  Modal.setAppElement(document.getElementById('root') || document.body);
}

const Report = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const toast = useToast();

  const handleSubmit = () => {
    if (description.trim()) {
      if (description.length < 5) {
        toast('Description must be at least 5 characters long.', 'warning');
        return;
      }
      onSubmit(description);
      setDescription('');
      onClose();
    } else {
      toast('Please enter a description before submitting.', 'warning');
    }
  };

  const handleRequestClose = () => {
    // Trigger shake animation
    setIsShaking(true);
    
    // Show toast notification
    toast('Please close the report dialog to continue', 'warning');
    
    // Remove shake animation after it completes
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Custom styles for React Modal
  const modalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(2px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      fontFamily: "'Inria Sans', serif",
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleRequestClose}
      style={modalStyles}
      closeTimeoutMS={300}
      shouldCloseOnOverlayClick={false} // We handle this manually
      shouldCloseOnEsc={true}
      contentLabel="Report Modal"
    >
      <div className={`report-modal-content ${isShaking ? 'shake-animation' : ''}`}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="report-title">REPORT</h2>
        <p className="report-instruction">Please provide more detail about the issues</p>
        <textarea
          className="report-textarea"
          placeholder="Enter the description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
        />
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </Modal>
  );
};

export default Report;
