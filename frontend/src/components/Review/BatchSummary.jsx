import React from "react";
import { useNavigate } from "react-router-dom";

const BatchSummary = ({
  summary,
  onContinue,
  onBackToList,
  onCompleteSession, // Add new prop for completing session
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="batch-summary loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Calculating your progress...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const {
    batchNumber,
    totalBatches,
    wordsInBatch,
    correctAnswers,
    accuracy,
    words,
    overallProgress,
  } = summary;

  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    } else {
      navigate("/vocabulary");
    }
  };

  const handleCompleteSession = () => {
    if (onCompleteSession) {
      onCompleteSession();
    } else {
      // Fallback to back to list
      handleBackToList();
    }
  };

  return (
    <div className="batch-summary">
      <div className="summary-container">
        <div className="summary-header">
          <h2>Batch {batchNumber} Complete!</h2>
          <p className="batch-info">
            You've completed batch {batchNumber} of {totalBatches}
          </p>
        </div>

        <div className="summary-stats">
          <div className="stat-card primary">
            <div className="stat-number">{accuracy}%</div>
            <div className="stat-label">Batch Accuracy</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {correctAnswers}/{wordsInBatch}
            </div>
            <div className="stat-label">Correct Answers</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {overallProgress.overallAccuracy}%
            </div>
            <div className="stat-label">Overall Accuracy</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {overallProgress.completedWords}/{overallProgress.totalWords}
            </div>
            <div className="stat-label">Total Progress</div>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-label">
            Overall Progress: {overallProgress.completedWords} of{" "}
            {overallProgress.totalWords} words
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(overallProgress.completedWords / overallProgress.totalWords) * 100}%`,
              }}
            ></div>
          </div>
          <div className="progress-percentage">
            {Math.round(
              (overallProgress.completedWords / overallProgress.totalWords) *
                100
            )}
            %
          </div>
        </div>

        {words && words.length > 0 && (
          <div className="words-review">
            <h3>Words in This Batch</h3>
            <div className="words-grid">
              {words.map((word, index) => (
                <div
                  key={word.id || index}
                  className={`word-item ${word.result === "correct" ? "correct" : "incorrect"}`}
                >
                  <div className="word-term">{word.term}</div>
                  <div className="word-definition">{word.definition}</div>
                  <div className={`word-result ${word.result}`}>
                    {word.result === "correct" ? "✓" : "✗"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="summary-actions">
          <button
            className="btn secondary"
            onClick={handleBackToList}
            type="button"
          >
            Back to Lists
          </button>

          {batchNumber < totalBatches && (
            <button className="btn primary" onClick={onContinue} type="button">
              Continue Review
            </button>
          )}

          {batchNumber >= totalBatches && (
            <button
              className="btn primary"
              onClick={handleCompleteSession}
              type="button"
            >
              Complete Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchSummary;
