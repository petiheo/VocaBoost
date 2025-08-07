import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, data } from "react-router-dom";
import { Header, SideBar, Footer, ReportTrigger } from "../../components";
import reviewService from "../../services/Review/reviewService";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { useToast } from "../../components/Providers/ToastProvider.jsx";
import { useConfirm } from "../../components/Providers/ConfirmProvider.jsx";
import { ArrowLeftIcon, ArrowRightIcon } from "../../assets/Review";

export default function StudyWithFlashcard() {
  const { sessionId, listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);

  const [listInfo, setListInfo] = useState(location.state?.listInfo || null);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Cleanup effect to prevent API calls when component unmounts
  useEffect(() => {
    return () => {
      // Mark session as completed when component unmounts to prevent any pending API calls
      setIsSessionCompleted(true);
    };
  }, []);

  useEffect(() => {
    async function initializeStudySession() {
      // Don't initialize if session is already completed
      if (isSessionCompleted) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Get list info if not passed through navigation state
        if (!listInfo && listId) {
          const info = await vocabularyService.getListById(listId);
          setListInfo(info);
        }

        // If we have a resumed session from batch summary, use it
        if (location.state?.resumedSession) {
          const resumedSession = location.state.resumedSession;
          setSession(resumedSession);
          setWords(resumedSession.remainingWords || []);
          // Calculate current index based on completed words
          const completedWords = resumedSession.completedWords || 0;
          const wordsPerBatch = resumedSession.wordsPerBatch || 10;
          const currentBatchStartIndex = Math.floor(completedWords / wordsPerBatch) * wordsPerBatch;
          setCurrentWordIndex(completedWords - currentBatchStartIndex);
        }
        // If sessionId exists, we're continuing a session
        else if (sessionId) {
          const sessionStatus = await reviewService.getActiveSessionStatus();
          if (sessionStatus?.activeSession) {
            setSession(sessionStatus.activeSession);
            setWords(sessionStatus.activeSession.remainingWords || []);
            // Set current index based on completed progress
            const completedWords = sessionStatus.activeSession.completedWords || 0;
            const wordsPerBatch = sessionStatus.activeSession.wordsPerBatch || 10;
            const currentBatchStartIndex = Math.floor(completedWords / wordsPerBatch) * wordsPerBatch;
            setCurrentWordIndex(completedWords - currentBatchStartIndex);
          }
        } else {
          // Check for existing active session first
          const activeSessionResponse = await reviewService.getActiveSessionStatus();
          
          if (activeSessionResponse?.activeSession) {
            // End the existing session first
            try {
              await reviewService.endSession(activeSessionResponse.activeSession.sessionId);
            } catch (endError) {
              console.warn("Failed to end existing session:", endError);
              // Continue anyway to try starting new session
            }
          }

          // Start a new session - this will get words automatically
          // First try normal mode (due words only)
          let sessionResponse;
          try {
            sessionResponse = await reviewService.startSession({
              listId: listId || listInfo?.id,
              sessionType: 'flashcard'
            });

            // Check if backend automatically switched to practice mode
            if (sessionResponse.session.practiceMode) {
              toast("No due words found. Starting practice mode with all words.", "success");
            }
          } catch (error) {
            console.log("Error starting session:", error);
            
            // If no words in list at all
            const isNoWordsError = 
              error.message?.includes('has no words to practice') ||
              error.response?.data?.message?.includes('has no words to practice');
            
            if (isNoWordsError) {
              toast("This list has no words to practice.", "error");
              navigate(`/review/${listId || listInfo?.id}`);
              return;
            } else {
              throw error; // Re-throw if it's a different error
            }
          }
          if (sessionResponse?.session) {
            setSession(sessionResponse.session);
            setWords(sessionResponse.session.words || []);
          }
        }

      } catch (err) {
        console.error("Error initializing study session:", err);
        toast("Failed to start study session", "error");
      } finally {
        setLoading(false);
      }
    }

    initializeStudySession();
  }, [sessionId, listId, listInfo, toast, confirm, isSessionCompleted, navigate]);

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (known) => {
    try {
      const currentWord = words[currentWordIndex];
      
      // Submit the result to the backend
      await reviewService.submitResult(session?.sessionId || sessionId, {
        wordId: currentWord.id,
        result: known ? 'correct' : 'incorrect',
        responseTimeMs: Date.now() - (session?.startTime || Date.now())
      });

      // Check if we need to show batch summary (after every 10 words)
      const currentProgress = currentWordIndex + 1;
      const wordsPerBatch = 10;
      const needsBatchSummary = currentProgress % wordsPerBatch === 0 && currentProgress < words.length;

      if (needsBatchSummary) {
        // Show batch summary
        const batchSummary = await reviewService.getBatchSummary(session?.sessionId || sessionId);
        
        // Use listId from batch summary (from backend) or fallback to URL params
        const targetListId = batchSummary.listId || listId || listInfo?.id;
        console.log("StudyWithFlashcard - navigating to batch-summary with listId:", targetListId);
        console.log("Available IDs - batchSummary.listId:", batchSummary.listId, "URL listId:", listId, "listInfo.id:", listInfo?.id);
        
        navigate(`/review/${targetListId}/batch-summary`, {
          state: { 
            summary: batchSummary,
            sessionId: session?.sessionId || sessionId,
            listId: targetListId, // Pass the actual listId
            listInfo,
            currentProgress
          }
        });
        return;
      }

      // Move to next word or finish session
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setIsFlipped(false);
      } else {
        // End session and get summary
        setIsSessionCompleted(true); // Mark session as completed to prevent further API calls
        const response = await reviewService.endSession(session?.sessionId || sessionId);
        const summary = response.summary || response; // Handle both wrapped and unwrapped responses
        
        // Use listId from end session response (from backend) or fallback to URL params
        const targetListId = summary.listId || listId || listInfo?.id;
        console.log("StudyWithFlashcard - ending session, navigating to summary with listId:", targetListId);
        console.log("Available IDs - summary.listId:", summary.listId, "URL listId:", listId, "listInfo.id:", listInfo?.id);
        
        console.log("StudyWithFlashcard - ending session, summary:", summary); // Debug log
        toast("Study session completed!", "success");
        navigate(`/review/${targetListId}/summary`, {
          state: { 
            summary,
            sessionId: session?.sessionId || sessionId,
            listId: targetListId, // Pass the actual listId
          }
        });
      }
    } catch (err) {
      console.error("Error submitting response:", err);
      toast("Error recording response", "error");
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setIsFlipped(false);
    }
  };

  // Removed handleReportSubmit - now handled directly in ReportTrigger for reusability

  const handleEndSession = async () => {
    try {
      await reviewService.endSession(session?.sessionId || sessionId);
      navigate(`/review/${listId || listInfo?.id}`);
    } catch (err) {
      console.error("Error ending session:", err);
      toast("Error ending session", "error");
    }
  };

  if (loading) {
    return (
      <div className="flashcard">
        <Header />
        <h1 className="flashcard__title">Review with Spaced Repetition</h1>
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen}/>
        <div className="flashcard__content">
          <div className="loading">Loading study session...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="flashcard">
        <Header />
        <h1 className="flashcard__title">Review with Spaced Repetition</h1>
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen}/>
        <div className="flashcard__content">
          <div className="error">No words found for this list</div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / words.length) * 100;

  return (
    <div className="flashcard">
      <Header />
      <h1 className="flashcard__title">
        {listInfo?.title || "Flashcard Study"} ({currentWordIndex + 1}/{words.length})
      </h1>
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen}/>

      <div className="flashcard__content">
        <div className="flashcard__card">
          <button 
            className="flashcard__prev" 
            onClick={handlePrevious}
            disabled={currentWordIndex === 0}
          >
            <img src={ArrowLeftIcon} alt="Previous" className="flashcard__icon" />
          </button>

          <div className="flashcard__animation" onClick={handleFlipCard}>
            <div className={`card__inner ${isFlipped ? "is-flipped" : ""}`}>
              <div className="card__face card__front">
                <div className="card__report-trigger">
                  <ReportTrigger 
                    wordId={currentWord.id}
                  />
                </div>
                <div className="card__content">
                  {currentWord.term}
                </div>
              </div>
              <div className="card__face card__back">
                <div className="card__report-trigger">
                  <ReportTrigger 
                    wordId={currentWord.id}
                  />
                </div>
                <div className="card__content">
                  <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    {currentWord.definition}
                  </div>
                  {currentWord.phonetics && (
                    <div style={{ fontSize: '1rem', color: '#007bff', fontStyle: 'italic', marginBottom: '1rem' }}>
                      {currentWord.phonetics}
                    </div>
                  )}
                  {currentWord.examples && currentWord.examples.length > 0 && (
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', fontStyle: 'italic' }}>
                      "{currentWord.examples[0].example_sentence}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button 
            className="flashcard__next" 
            onClick={handleNext}
            disabled={currentWordIndex === words.length - 1}
          >
            <img src={ArrowRightIcon} alt="Next" className="flashcard__icon" />
          </button>
        </div>

        {isFlipped && (
          <div className="flashcard__controls">
            <button 
              className='know'
              onClick={() => handleResponse(false)}
            >
              Unknow
            </button>
            <button 
              className='unknow'
              onClick={() => handleResponse(true)}
            >
              Know
            </button>
          </div>
        )}

        {!isFlipped && (
          <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '1rem', marginTop: '1rem' }}>
            Click the card to see the definition
          </div>
        )}
      </div>

      <div className="flashcard__submit">
        <button className="flashcard__submit-button" onClick={handleEndSession}>
          End Session
        </button>
      </div>

      <Footer />
    </div>
  );
}