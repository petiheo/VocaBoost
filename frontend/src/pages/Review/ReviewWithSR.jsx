import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components";
import reviewService from "../../services/Review/reviewService";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { useToast } from "../../components/Providers/ToastProvider.jsx";
import { useConfirm } from "../../components/Providers/ConfirmProvider.jsx";
import { DropdownIcon } from "../../assets/Vocabulary/index.jsx";

export default function ReviewWithSR() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);

  const [listInfo, setListInfo] = useState(null);
  const [reviewMethod, setReviewMethod] = useState("Flashcard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reviewMethods = ["Flashcard", "Fill in the blank", "Word Association"];

  useEffect(() => {
    async function fetchListInfo() {
      try {
        setLoading(true);
        const info = await vocabularyService.getListById(listId);
        setListInfo(info);
      } catch (err) {
        console.error("Error fetching list info:", err);
        setError("Failed to load vocabulary list");
        toast("Failed to load vocabulary list", "error");
      } finally {
        setLoading(false);
      }
    }

    if (listId) {
      fetchListInfo();
    }
  }, [listId, toast]);

  const handleStartReview = async () => {
    try {
      console.log(
        "Starting review for listId:",
        listId,
        "method:",
        reviewMethod
      );

      // Navigate directly for specific methods without session
      if (reviewMethod === "Flashcard") {
        navigate(`/review/${listId}/flashcard`, {
          state: { method: reviewMethod, listInfo },
        });
        return;
      } else if (reviewMethod === "Fill in the blank") {
        navigate(`/review/${listId}/fill-in-blank`, {
          state: { method: reviewMethod, listInfo },
        });
        return;
      }

      // For other methods, start a review session
      // Map frontend method names to backend sessionType values
      let sessionType;
      switch (reviewMethod) {
        case "Fill in the blank":
          sessionType = "fill_blank";
          break;
        case "Word Association":
          sessionType = "word_association";
          break;
        default:
          sessionType = "flashcard";
      }

      const requestData = {
        listId: listId,
        sessionType: sessionType,
      };
      console.log("Request data:", requestData);

      let sessionResponse;
      try {
        sessionResponse = await reviewService.startSession(requestData);
        console.log("Session response:", sessionResponse);

        // Check if backend automatically switched to practice mode
        if (sessionResponse.session.practiceMode && !requestData.practiceMode) {
          toast(
            "No due words found. Starting practice mode with all words.",
            "success"
          );
        }
      } catch (error) {
        console.log("Error starting session:", error);
        console.log("Error details:", {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data,
        });

        // If no words in list at all, offer practice mode choice
        const isNoWordsError =
          error.message?.includes("has no words to practice") ||
          error.response?.data?.message?.includes("has no words to practice");

        if (isNoWordsError) {
          toast("This list has no words to practice.", "error");
          return;
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      // Navigate to the actual review interface
      navigate(`/review/session/${sessionResponse.session.sessionId}`, {
        state: { method: reviewMethod, listInfo },
      });
    } catch (err) {
      console.error("Error starting review session:", err);
      toast("Failed to start review session", "error");
    }
  };

  if (loading) {
    return (
      <div className="review">
        <Header />
        <h1 className="review__title">Review with Spaced Repetition</h1>
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="review__content">
          <div className="review__main">
            <p>Loading list information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listInfo) {
    return (
      <div className="review">
        <Header />
        <h1 className="review__title">Review with Spaced Repetition</h1>
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="review__content">
          <div className="review__main">
            <p className="error">{error || "Vocabulary list not found"}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="review">
      <Header />
      <h1 className="review__title">Review with Spaced Repetition</h1>
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="review__content">
        <div className="review__main">
          <div className="review__header">
            <div className="review__list-title">{listInfo.title}</div>

            {listInfo.tags && listInfo.tags.length > 0 && (
              <div className="review__tags">
                {listInfo.tags.map((tag, index) => (
                  <span key={index} className="review__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="review__creator">
              <div>
                Created by: {listInfo.created_by?.full_name || "Unknown"}
              </div>
            </div>
          </div>

          <div className="review__information">
            <div className="sub-title">Description</div>
            <div className="sub-content">
              {listInfo.description || "No description available"}
            </div>
            <div className="stats">
              <div className="sub-title">Total words:</div>
              <div className="sub-content">
                {listInfo.word_count || 0} words
              </div>
            </div>
          </div>

          <div className="review__methods">
            <div className="review__information">
              <div className="sub-title">Method:</div>
            </div>
            <div className="review__dropdownWrapper">
              <select
                value={reviewMethod}
                onChange={(e) => setReviewMethod(e.target.value)}
              >
                {reviewMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <img
                src={DropdownIcon}
                alt="DropdownIcon"
                className="dropdown__icon"
              />
            </div>
          </div>

          <div className="review__start">
            <button
              className="review__start-button"
              onClick={handleStartReview}
            >
              Start Review Session
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
