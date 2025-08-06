import React, { useState } from 'react';
import Modal from 'react-modal';
import { useToast } from '../Providers/ToastProvider.jsx';
import { useModal } from '../../hooks/useModal.js';

const Report = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const toast = useToast();
  const { getModalProps, getContentProps, getOverlayProps, handleClose, isShaking } = useModal(onClose, { blockInteractions: false });

  const handleSubmit = () => {
    if (description.trim()) {
      if (description.length < 5) {
        toast('Description must be at least 5 characters long.', 'warning');
        return;
      }
      
      try {
        onSubmit(description);
        setDescription('');
        handleClose();
      } catch (error) {
        console.error('Error during submit:', error);
        handleClose();
      }
    } else {
      toast('Please enter a description before submitting.', 'warning');
    }
  };

  return (
    <Modal {...getModalProps()}>
      <div {...getOverlayProps()} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          {...getContentProps()}
          className={`${getContentProps().className} report-modal-content`}
        >
        <button 
          className="close-button" 
          onClick={handleClose}
        >
          ×
        </button>
        
        <h2 className="report-title">
          REPORT
        </h2>
        
        <p className="report-instruction">
          Please provide more detail about the issues
        </p>
        
        <textarea
          className="report-textarea"
          placeholder="Enter the description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClose();
            }
          }}
        />
        
        <button 
          className="submit-button" 
          onClick={handleSubmit}
        >
          Submit
        </button>
        </div>
      </div>
    </Modal>
  );
};

export default Report;
