import { useState } from 'react';
import Report from './Report';
import { ReportIcon } from '../assets/icons/index'; 

const ReportTrigger = ({wordId}) => {
  const [show, setShow] = useState(false);

  const handleSubmit = async(reason) => {
    try {
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
    } catch(error) {
      alert('Failed to send report')
    }
  }

  return (
    <>
      <button className="report-trigger-button" onClick={() => setShow(true)}>
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
