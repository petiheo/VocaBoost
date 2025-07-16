import { useState } from 'react';
import Report from './Report';
import { ReportIcon } from '../assets/icons/index'; 

const ReportTrigger = () => {
  const [show, setShow] = useState(false);

  const handleSubmit = async (message) => {
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      alert('Report sent successfully!');
    } catch (error) {
      alert('Failed to send report.');
    }
  };

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
