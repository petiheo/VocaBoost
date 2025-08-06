import { useState } from 'react';
import Report from './Report';
import { ReportIcon } from '../../assets/icons/index'; 

const ReportTrigger = ({wordId, onReportSubmit}) => {
  const [show, setShow] = useState(false);

  const handleSubmit = async(reason) => {
    try {
      if (onReportSubmit) {
        await onReportSubmit(reason);
      } else {
        const res = await fetch('/api/user/report', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({wordId, reason})
        });
      
        const data = await res.json();

        if (data.success) {
            alert('Report submitted successfully');
          }
          else {
            alert(data.error || 'Failed to submit report');
        }
      }
      setShow(false);
    } catch(error) {
      alert('Failed to send report')
    }
  }

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking report button
    setShow(true);
  };

  return (
    <>
      <button className="report-trigger-button" onClick={handleClick}>
        <img src={ReportIcon} alt="Report" />
      </button>

      {show && (
        <Report
          onClose={() => setShow(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default ReportTrigger;
