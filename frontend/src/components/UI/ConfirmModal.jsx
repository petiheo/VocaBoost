import React from 'react';
import Modal from 'react-modal';
import { useModal } from '../../hooks/useModal.js';


export default function ConfirmModal({ message, onConfirm, onCancel }) {
  const { getModalProps, getContentProps, getOverlayProps, handleClose } = useModal(onCancel);

  const handleConfirm = () => {
    try {
      onConfirm();
      handleClose();
    } catch (error) {
      console.error('Error during confirm:', error);
      handleClose();
    }
  };

  const handleCancel = () => {
    try {
      onCancel();
      handleClose();
    } catch (error) {
      console.error('Error during cancel:', error);
      handleClose();
    }
  };

  // Custom styles for confirm modal
  const customStyles = {
    content: {
      maxWidth: '400px',
      padding: '30px',
      textAlign: 'center'
    }
  };

  return (
    <Modal {...getModalProps(customStyles)}>
      <div {...getOverlayProps()} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div {...getContentProps()}>
        <button 
          className="close-button" 
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        
        <h2 
          className="confirm-title"
          style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: '#333',
            fontWeight: 'bold'
          }}
        >
          CONFIRM
        </h2>
        
        <p 
          className="confirm-message"
          style={{
            fontSize: '16px',
            marginBottom: '30px',
            color: '#555',
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>
        
        <div 
          className="modal-buttons"
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center'
          }}
        >
          <button 
            onClick={handleConfirm} 
            className="btn-confirm"
            style={{
              padding: '12px 24px',
              backgroundColor: '#41d518ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
              minWidth: '80px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#09a811ff'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#41d518ff'}
          >
            Yes
          </button>
          <button 
            onClick={handleCancel} 
            className="btn-cancel"
            style={{
              padding: '12px 24px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
              minWidth: '80px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            No
          </button>
        </div>
        </div>
      </div>
    </Modal>
  );
}
