import { useState, useRef } from 'react';
import Report from './Report';
import { ReportIcon } from '../../assets/icons/index'; 
import { useToast } from '../Providers/ToastProvider.jsx';
import reportService from '../../services/Report/reportService'; 

// Global modal state to prevent multiple modals
let isModalOpen = false;

const ReportTrigger = ({wordId, onReportSubmit}) => {
  const [show, setShow] = useState(false);
  const isClickingRef = useRef(false);
  const toast = useToast();

  const handleSubmit = async(reason) => {
    try {
      if (onReportSubmit) {
        await onReportSubmit(reason);
      } else {
        // Use reportService instead of direct fetch to API
        const response = await reportService.reportContent(wordId, reason);
        
        if (response.success) {
          toast('Report submitted successfully', 'success');
        } else {
          toast(response.message || response.error || 'Failed to submit report', 'error');
        }
      }
      setShow(false);
    } catch(error) {
      console.error('Report submission error:', error);
      const data = error.response?.data || {};
      toast(data.message || 'Failed to send report', 'error');
      setShow(false);
    }
  }

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking report button
    
    // Prevent multiple clicks and multiple modals
    if (isClickingRef.current || isModalOpen) {
      return;
    }
    
    isClickingRef.current = true;
    isModalOpen = true;
    setShow(true);
    
    // Reset click guard after a short delay
    setTimeout(() => {
      isClickingRef.current = false;
    }, 300);
  };

  const handleClose = () => {
    setShow(false);
    isModalOpen = false; // Reset global modal state
  };

  const handleModalSubmit = async (reason) => {
    try {
      await handleSubmit(reason);
      handleClose(); // Use the new close handler
    } catch (error) {
      // Error handling already done in handleSubmit
      handleClose();
    }
  };

  return (
    <>
      <button className="report-trigger-button" onClick={handleClick}>
        <img src={ReportIcon} alt="Report" />
      </button>

      {show && (
        <Report
          onClose={handleClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
};

export default ReportTrigger;
