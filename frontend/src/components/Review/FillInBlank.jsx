import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const FillInBlank = ({
  question,
  correctAnswer,
  hint,
  currentIndex,
  totalQuestions,
  onAnswer,
  onDontKnow,
  onContinue,
  onEndSession,
  listTitle,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Reset state when question changes
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);

    // Focus input on new question
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const handleCheck = () => {
    if (!userAnswer.trim()) return;

    const correct =
      userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (onAnswer) {
      onAnswer(correct, userAnswer);
    }
  };

  const handleDontKnow = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setUserAnswer("");

    if (onDontKnow) {
      onDontKnow();
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  // Remove handleKeyDown - form submission handles Enter key properly

  const getFeedbackClass = () => {
    if (!isAnswered) return "";
    return isCorrect
      ? "fill-blank__feedback--correct"
      : "fill-blank__feedback--incorrect";
  };

  return (
    <div className="fill-blank">
      <div className="fill-blank__header">
        <h1 className="fill-blank__title">
          {listTitle || "Fill in the Blank"}
        </h1>
        <div className="fill-blank__progress">
          {currentIndex} of {totalQuestions}
        </div>
      </div>

      <div className="fill-blank__content">
        <div className="fill-blank__question-container">
          <p className="fill-blank__question">{question}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isAnswered && userAnswer.trim()) {
                handleCheck();
              }
            }}
          >
            <div className="fill-blank__answer-section">
              <label htmlFor="answer-input" className="fill-blank__label">
                Your answer:
              </label>
              <input
                id="answer-input"
                ref={inputRef}
                type="text"
                className={`fill-blank__input ${isAnswered ? "fill-blank__input--disabled" : ""}`}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isAnswered}
                placeholder="Type your answer here..."
                autoComplete="off"
                aria-label="Answer input"
                aria-describedby={isAnswered ? "feedback-message" : undefined}
              />
            </div>

            {!isAnswered && (
              <div className="fill-blank__actions">
                <button
                  type="button"
                  className="fill-blank__button fill-blank__button--secondary"
                  onClick={handleDontKnow}
                  aria-label="Don't know the answer"
                >
                  Don't know
                </button>
                <button
                  type="submit"
                  className="fill-blank__button fill-blank__button--primary"
                  disabled={!userAnswer.trim()}
                  aria-label="Check answer"
                >
                  Check
                </button>
              </div>
            )}
          </form>

          {isAnswered && (
            <div
              id="feedback-message"
              className={`fill-blank__feedback ${getFeedbackClass()}`}
              role="alert"
              aria-live="polite"
            >
              <div className="fill-blank__feedback-icon">
                {isCorrect ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="currentColor"
                      fillOpacity="0.2"
                    />
                    <path
                      d="M8 12L11 15L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="currentColor"
                      fillOpacity="0.2"
                    />
                    <path
                      d="M15 9L9 15M9 9L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="fill-blank__feedback-content">
                <p className="fill-blank__feedback-text">{question}</p>
                <div className="fill-blank__correct-answer">
                  <strong className="fill-blank__answer-term">
                    {correctAnswer}
                  </strong>
                  {hint && (
                    <span className="fill-blank__answer-hint">. {hint}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`fill-blank__bottom-actions ${isAnswered ? "fill-blank__bottom-actions--with-continue" : ""}`}
      >
        {isAnswered && (
          <button
            className="fill-blank__button fill-blank__button--continue"
            onClick={handleContinue}
            autoFocus
            aria-label="Continue to next question"
          >
            Continue
          </button>
        )}

        <button
          className="fill-blank__submit-button"
          onClick={onEndSession}
          aria-label="End learning session"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

FillInBlank.propTypes = {
  question: PropTypes.string.isRequired,
  correctAnswer: PropTypes.string.isRequired,
  hint: PropTypes.string,
  currentIndex: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onAnswer: PropTypes.func,
  onDontKnow: PropTypes.func,
  onContinue: PropTypes.func,
  onEndSession: PropTypes.func,
  listTitle: PropTypes.string,
};

FillInBlank.defaultProps = {
  hint: "",
  onAnswer: null,
  onDontKnow: null,
  onContinue: null,
  onEndSession: null,
  listTitle: "",
};

export default FillInBlank;
