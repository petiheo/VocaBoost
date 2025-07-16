import React, { useState } from 'react';

const Report = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (description.trim()) {
      // Gửi message report về backend
      onSubmit(description);
      setDescription('');
      onClose();
    } else {
      alert('Please enter a description before submitting.');
    }
  };

  return (
    <div className="report-overlay">
      <div className="report-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="report-title">REPORT</h2>
        <p className="report-instruction">Please provide more detail about the issues</p>
        <textarea
          className="report-textarea"
          placeholder="Enter the description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default Report;
