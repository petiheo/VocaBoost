import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { SideBar, Footer } from "../../components";
import reviewService from "../../services/Review/reviewService";
import { useToast } from "../../components/Providers/ToastProvider.jsx";
import MainPageLogo from "../../assets/Logo.svg";
import { SummaryBackground } from "../../assets/Review/index.jsx";

export default function SessionSummary() {
  const { sessionId: sessionIdFromParams, listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Debug: Log current URL and params
  console.log("SessionSummary - Current URL:", window.location.pathname);
  console.log("SessionSummary - URL params:", { sessionIdFromParams, listId });
  console.log("SessionSummary - Location state:", location.state);

  // Get sessionId from either URL params or navigation state
  const sessionId = sessionIdFromParams || location.state?.sessionId;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSessionSummary() {
      try {
        setLoading(true);

        // If summary is passed through navigation state, use it
        if (location.state?.summary) {
          console.log("Received summary data:", location.state.summary); // Debug log
          setSummary(location.state.summary);
          setLoading(false);
          return;
        }

        // Otherwise, fetch the session summary from the backend
        // This would typically happen if user refreshes the page
        if (sessionId) {
          // Note: This would require a new endpoint to get completed session summary
          // For now, we'll show a generic message
          setError(
            "Session summary not available. Please start a new review session."
          );
        } else {
          setError("No session information available.");
        }
      } catch (err) {
        console.error("Error fetching session summary:", err);
        setError("Failed to load session summary");
        toast("Failed to load session summary", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchSessionSummary();
  }, [sessionId, location.state, toast]);

  const handleContinueReviewing = async () => {
    try {
      // Try to start a new review session directly
      const sessionResponse = await reviewService.startSession({
        listId: listId || summary?.listId,
        sessionType: "flashcard",
      });

      // Check if backend automatically switched to practice mode
      if (sessionResponse.session.practiceMode) {
        toast(
          "No due words found. Starting practice mode with all words.",
          "info"
        );
      }

      // Navigate directly to the flashcard session
      navigate(`/review/session/${sessionResponse.session.sessionId}`, {
        state: { method: "Flashcards", listInfo: summary?.listInfo },
      });
    } catch (error) {
      // Handle case where list has no words at all
      if (error.message?.includes("has no words to practice")) {
        toast("This list has no words to practice.", "error");
      } else {
        console.error("Error starting session:", error);
        toast("Failed to start session", "error");
      }
    }
  };

  const handleBackToList = () => {
    // Navigate back to the vocabulary list
    // Multiple sources for listId in priority order:
    // 1. summary.listId (from backend session data)
    // 2. location.state.listId (from navigation state)
    // 3. listId from URL params (could be unreliable)
    const targetListId = summary?.listId || location.state?.listId || listId;

    console.log("SessionSummary - navigating to list with ID:", targetListId);
    console.log("Current URL:", window.location.pathname);
    console.log(
      "URL params - sessionId:",
      sessionIdFromParams,
      "listId:",
      listId
    );
    console.log("Summary listId:", summary?.listId);
    console.log("Location state listId:", location.state?.listId);
    console.log("Summary object:", summary);
    console.log("Location state:", location.state);
    console.log("SessionId:", sessionId);

    // Debug: Check if summary.listId exists and is different from sessionId
    if (summary?.listId) {
      console.log("Summary has listId:", summary.listId);
      console.log(
        "Is summary.listId same as sessionId?",
        summary.listId === sessionId
      );
    } else {
      console.log(
        "Summary does not have listId, using location.state.listId:",
        location.state?.listId,
        "or URL listId:",
        listId
      );
    }

    // Validate listId before navigation
    if (!targetListId || typeof targetListId !== "string") {
      console.error("Invalid listId:", targetListId);
      toast("Invalid list ID, returning to vocabulary", "error");
      navigate("/vocabulary");
      return;
    }

    // Additional validation: check if this looks like a sessionId instead of listId
    if (targetListId === sessionId) {
      console.error(
        "listId matches sessionId - this indicates a routing issue:",
        targetListId
      );
      console.error(
        "This means the listId is not being passed correctly from backend or routing"
      );
      toast(
        "Error: Unable to determine correct list ID. Returning to vocabulary page.",
        "error"
      );
      navigate("/vocabulary");
      return;
    }

    navigate(`/vocabulary/view/${targetListId}`);
  };

  const calculateAccuracyPercentage = () => {
    if (!summary || !summary.totalWords || summary.totalWords === 0) return 0;
    const total = parseInt(summary.totalWords) || 0;
    const correct = parseInt(summary.correctAnswers) || 0;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const getAccuracyColor = () => {
    const percentage = calculateAccuracyPercentage();
    if (percentage >= 80) return "#23ca2bff"; // Green
    if (percentage >= 50) return "#ffc310ff"; // Yellow
    return "#db1e31ff"; // Red
  };

  if (loading) {
    return (
      <div
        className="session-summary"
        style={{
          backgroundImage: `url(${SummaryBackground})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="session-summary__content">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <main className="session-summary__main">
            <div className="loading">Loading session summary...</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div
        className="session-summary"
        style={{
          backgroundImage: `url(${SummaryBackground})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="session-summary__content">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <main className="session-summary__main">
            <div className="session-summary__container">
              <div className="error">
                {error || "Session summary not available"}
              </div>
              <button
                className="session-summary__button session-summary__button--primary"
                onClick={() => navigate("/vocabulary")}
              >
                Back to Vocabulary
              </button>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const accuracyPercentage = calculateAccuracyPercentage();

  return (
    <div
      className="session-summary"
      style={{
        backgroundImage: `url(${SummaryBackground})`,
        backgroundSize: "100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="session-summary__content">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="session-summary__main">
          <div className="session-summary__container">
            <img
              src={MainPageLogo}
              alt="Logo"
              className="session-summary__logo"
            />
            <div className="session-summary__header">
              <h1 className="session-summary__title">Session summary</h1>
              <p className="session-summary__subtitle">
                Congratulations! You reviewed all of your vocabulary
              </p>
            </div>

            <div className="session-summary__stats">
              <div className="session-summary__stat-card">
                <div className="session-summary__check-icon">
                  <div className="session-summary__check-circle">
                    <svg
                      viewBox="0 0 24 24"
                      className="session-summary__check-mark"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                </div>
                <div className="session-summary__stat-info">
                  <div className="session-summary__stat-label">Accuracy</div>
                  <div
                    className="session-summary__stat-value"
                    style={{ color: getAccuracyColor() }}
                  >
                    {accuracyPercentage}%
                  </div>
                  <div className="session-summary__stat-label">
                    Reviewed words
                  </div>
                  <div className="session-summary__stat-value session-summary__stat-value--blue">
                    {summary.totalWords || 0}
                  </div>
                </div>
              </div>

              <div className="session-summary__accuracy-circle">
                <svg
                  className="session-summary__circle-chart"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="session-summary__circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="session-summary__circle-bar"
                    strokeDasharray={`${accuracyPercentage}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{ stroke: getAccuracyColor() }}
                  />
                </svg>
                <div className="session-summary__circle-text">
                  {accuracyPercentage}%
                </div>
              </div>
            </div>

            <div className="session-summary__details">
              <div className="session-summary__detail-item">
                <span className="session-summary__detail-label">
                  Total Words:
                </span>
                <span className="session-summary__detail-value">
                  {summary.totalWords || 0}
                </span>
              </div>
              <div className="session-summary__detail-item">
                <span className="session-summary__detail-label">
                  Correct Answers:
                </span>
                <span className="session-summary__detail-value session-summary__detail-value--green">
                  {summary.correctAnswers || 0}
                </span>
              </div>
              <div className="session-summary__detail-item">
                <span className="session-summary__detail-label">
                  Incorrect Answers:
                </span>
                <span className="session-summary__detail-value session-summary__detail-value--red">
                  {summary.incorrectAnswers || 0}
                </span>
              </div>
              {summary.totalBatches && (
                <div className="session-summary__detail-item">
                  <span className="session-summary__detail-label">
                    Total Batches:
                  </span>
                  <span className="session-summary__detail-value">
                    {summary.totalBatches}
                  </span>
                </div>
              )}
              {summary.completedAt && (
                <div className="session-summary__detail-item">
                  <span className="session-summary__detail-label">
                    Completed At:
                  </span>
                  <span className="session-summary__detail-value">
                    {new Date(summary.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Batch Summaries Section */}
            {summary.batchSummaries && summary.batchSummaries.length > 0 && (
              <div className="session-summary__batch-section">
                <h3 className="session-summary__section-title-batch">
                  Batch Performance
                </h3>
                <div className="session-summary__batches">
                  {summary.batchSummaries.map((batch, index) => (
                    <div key={index} className="session-summary__batch-card">
                      <div className="session-summary__batch-header">
                        <span className="session-summary__batch-title">
                          Batch {batch.batchNumber}
                        </span>
                        <span
                          className={`session-summary__batch-accuracy ${
                            batch.accuracy >= 80
                              ? "high"
                              : batch.accuracy >= 50
                                ? "medium"
                                : "low"
                          }`}
                        >
                          {batch.accuracy}%
                        </span>
                      </div>
                      <div className="session-summary__batch-stats">
                        <span className="session-summary__batch-stat">
                          {batch.correctAnswers}/{batch.wordsInBatch} correct
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Words Review Section */}
            {summary.words && summary.words.length > 0 && (
              <div className="session-summary__words-section">
                <h3 className="session-summary__section-title-words">
                  Words Review
                </h3>
                <div className="session-summary__words-grid">
                  {summary.words.map((word, index) => (
                    <div
                      key={word.id || index}
                      className={`session-summary__word-item ${
                        word.result === "correct"
                          ? "correct"
                          : word.result === "incorrect"
                            ? "incorrect"
                            : "not-attempted"
                      }`}
                    >
                      <div className="session-summary__word-term">
                        {word.term}
                      </div>
                      <div className="session-summary__word-definition">
                        {word.definition}
                      </div>
                      <div
                        className={`session-summary__word-result ${word.result}`}
                      >
                        {word.result === "correct"
                          ? "✓"
                          : word.result === "incorrect"
                            ? "✗"
                            : "—"}
                      </div>
                      {word.responseTime && (
                        <div className="session-summary__word-time">
                          {Math.round(word.responseTime / 1000)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="session-summary__actions">
              <button
                className="session-summary__button session-summary__button--secondary"
                onClick={handleBackToList}
              >
                Back to List
              </button>
              {/* <button 
                className="session-summary__button session-summary__button--primary"
                onClick={handleContinueReviewing}
              >
                Continue Reviewing
              </button> */}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
