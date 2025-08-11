import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components";
import FillInBlank from "../../components/Review/FillInBlank";
import reviewService from "../../services/Review/reviewService";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { useToast } from "../../components/Providers/ToastProvider";
import { useConfirm } from "../../components/Providers/ConfirmProvider";

const FillInBlankPage = () => {
  const { listId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);

  const [listInfo, setListInfo] = useState(location.state?.listInfo || null);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Cleanup effect to prevent API calls when component unmounts
  useEffect(() => {
    return () => {
      setIsSessionCompleted(true);
    };
  }, []);

  useEffect(() => {
    async function initializeFillBlankSession() {
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
          const completedWords = resumedSession.completedWords || 0;
          const wordsPerBatch = resumedSession.wordsPerBatch || 10;
          const currentBatchStartIndex =
            Math.floor(completedWords / wordsPerBatch) * wordsPerBatch;
          setCurrentWordIndex(completedWords - currentBatchStartIndex);
        }
        // If sessionId exists, we're continuing a session
        else if (sessionId) {
          const sessionStatus = await reviewService.getActiveSessionStatus();
          if (sessionStatus?.activeSession) {
            setSession(sessionStatus.activeSession);
            setWords(sessionStatus.activeSession.remainingWords || []);
            const completedWords =
              sessionStatus.activeSession.completedWords || 0;
            const wordsPerBatch =
              sessionStatus.activeSession.wordsPerBatch || 10;
            const currentBatchStartIndex =
              Math.floor(completedWords / wordsPerBatch) * wordsPerBatch;
            setCurrentWordIndex(completedWords - currentBatchStartIndex);
          }
        } else {
          // Check for existing active session first
          const activeSessionResponse =
            await reviewService.getActiveSessionStatus();

          if (activeSessionResponse?.activeSession) {
            try {
              await reviewService.endSession(
                activeSessionResponse.activeSession.sessionId
              );
            } catch (endError) {
              console.warn("Failed to end existing session:", endError);
            }
          }

          // Start a new session for fill-in-blank
          let sessionResponse;
          try {
            sessionResponse = await reviewService.startSession({
              listId: listId || listInfo?.id,
              sessionType: "fill_blank",
            });

            if (sessionResponse.session.practiceMode) {
              toast(
                "No due words found. Starting practice mode with all words.",
                "success"
              );
            }
          } catch (error) {
            console.log("Error starting session:", error);

            const isNoWordsError =
              error.message?.includes("has no words to practice") ||
              error.response?.data?.message?.includes(
                "has no words to practice"
              );

            if (isNoWordsError) {
              toast("This list has no words to practice.", "error");
              navigate(`/review/${listId || listInfo?.id}`);
              return;
            } else {
              throw error;
            }
          }
          if (sessionResponse?.session) {
            setSession(sessionResponse.session);
            setWords(sessionResponse.session.words || []);
          }
        }
      } catch (err) {
        console.error("Error initializing fill-blank session:", err);
        toast("Failed to start fill-blank session", "error");
      } finally {
        setLoading(false);
      }
    }

    initializeFillBlankSession();
  }, [
    sessionId,
    listId,
    listInfo,
    toast,
    confirm,
    isSessionCompleted,
    navigate,
  ]);

  const generateQuestionSentence = (word) => {
    // If the word has an example sentence, use it with a blank
    if (word.vocabulary_examples?.example_sentence) {
      const sentence = word.vocabulary_examples.example_sentence;
      // Replace the word (case-insensitive) with underscores
      const regex = new RegExp(`\\b${word.term}\\b`, "gi");
      return sentence.replace(regex, "_____");
    }

    // Fallback: use the definition as a prompt
    return `${word.definition} (_____)`;
  };

  const handleAnswer = async (isCorrect, userAnswer) => {
    try {
      const currentWord = words[currentWordIndex];

      // Submit the result to the backend
      await reviewService.submitResult(session?.sessionId || sessionId, {
        wordId: currentWord.id,
        result: isCorrect ? "correct" : "incorrect",
        responseTimeMs: Date.now() - (session?.startTime || Date.now()),
      });

      // Just record the answer, don't navigate automatically
      // The navigation will be handled by handleContinue
    } catch (err) {
      console.error("Error handling answer:", err);
      toast("Failed to record answer", "error");
    }
  };

  const handleDontKnow = () => {
    handleAnswer(false, "");
  };

  const handleContinue = async () => {
    try {
      // Check if we need to show batch summary (after every 10 words)
      const currentProgress = currentWordIndex + 1;
      const wordsPerBatch = 10;
      const needsBatchSummary =
        currentProgress % wordsPerBatch === 0 && currentProgress < words.length;

      if (needsBatchSummary) {
        // Show batch summary
        const batchSummary = await reviewService.getBatchSummary(
          session?.sessionId || sessionId
        );

        const targetListId = batchSummary.listId || listId || listInfo?.id;
        navigate(`/review/${targetListId}/batch-summary`, {
          state: {
            summary: batchSummary,
            sessionId: session?.sessionId || sessionId,
            listId: targetListId,
            listInfo,
            currentProgress,
            sessionType: "fill_blank", // Pass session type for correct navigation
          },
        });
        return;
      }

      // Move to next word or finish session
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        // End session and get summary
        setIsSessionCompleted(true);
        const response = await reviewService.endSession(
          session?.sessionId || sessionId
        );
        const summary = response.summary || response;

        const targetListId = summary.listId || listId || listInfo?.id;
        toast("Fill-blank session completed!", "success");
        navigate(`/review/${targetListId}/summary`, {
          state: {
            summary,
            sessionId: session?.sessionId || sessionId,
            listId: targetListId,
          },
        });
      }
    } catch (err) {
      console.error("Error continuing to next word:", err);
      toast("Failed to continue", "error");
    }
  };

  const handleEndSession = async () => {
    try {
      if (session?.sessionId || sessionId) {
        const isConfirmed = await confirm(
          "Are you sure you want to end this session early?"
        );
        if (!isConfirmed) return;

        setIsSessionCompleted(true);
        const response = await reviewService.endSession(
          session?.sessionId || sessionId
        );
        const summary = response.summary || response;

        const targetListId = summary.listId || listId || listInfo?.id;
        toast("Session ended", "info");
        navigate(`/review/${targetListId}/summary`, {
          state: {
            summary,
            sessionId: session?.sessionId || sessionId,
            listId: targetListId,
          },
        });
      } else {
        // No active session, just go back
        navigate(-1);
      }
    } catch (error) {
      console.error("Error ending session:", error);
      toast("Failed to end session", "error");
    }
  };

  if (loading) {
    return (
      <div className="fill-blank-page">
        <Header />
        <div className="fill-blank-page__container">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="fill-blank-page__content">
            <div className="fill-blank-page__loading">
              <p>Loading questions...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="fill-blank-page">
        <Header />
        <div className="fill-blank-page__container">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="fill-blank-page__content">
            <div className="fill-blank-page__empty">
              <p>No words available for this list.</p>
              <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentWord = words[currentWordIndex];
  if (!currentWord) {
    return (
      <div className="fill-blank-page">
        <Header />
        <div className="fill-blank-page__container">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="fill-blank-page__content">
            <div className="fill-blank-page__loading">
              <p>Loading word...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="fill-blank-page">
      <Header />
      <div className="fill-blank-page__container">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="fill-blank-page__content">
          <FillInBlank
            question={generateQuestionSentence(currentWord)}
            correctAnswer={currentWord.term}
            hint={currentWord.definition}
            currentIndex={currentWordIndex + 1}
            totalQuestions={words.length}
            onAnswer={handleAnswer}
            onDontKnow={handleDontKnow}
            onContinue={handleContinue}
            onEndSession={handleEndSession}
            listTitle={listInfo?.title || ""}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FillInBlankPage;
