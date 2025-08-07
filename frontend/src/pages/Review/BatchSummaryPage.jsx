import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BatchSummary, Footer, Header, SideBar } from "../../components";
import { useToast } from "../../components/Providers/ToastProvider.jsx";
import reviewService from "../../services/Review/reviewService";

export default function BatchSummaryPage() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const [summary, setSummary] = useState(location.state?.summary || null);
  const [sessionId] = useState(location.state?.sessionId);
  const [listInfo] = useState(location.state?.listInfo);
  const [sessionType] = useState(location.state?.sessionType || "flashcard"); // Get session type from state
  const [loading, setLoading] = useState(!summary);

  useEffect(() => {
    // If no summary provided, try to fetch it
    if (!summary && sessionId) {
      const fetchSummary = async () => {
        try {
          setLoading(true);
          const batchSummary = await reviewService.getBatchSummary(sessionId);
          setSummary(batchSummary);
        } catch (error) {
          console.error("Error fetching batch summary:", error);
          toast("Failed to load batch summary", "error");
          // Navigate back if can't load summary
          navigate(`/vocabulary/${listId}`);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }
  }, [summary, sessionId, navigate, listId, toast]);

  const handleContinueReview = async () => {
    try {
      setLoading(true);

      // Resume the session
      const sessionData = await reviewService.resumeSession(sessionId);

      // Determine the correct route based on session type
      let route;
      if (sessionType === "fill_blank") {
        route = `/review/session/${sessionId}/fill-in-blank`;
      } else {
        route = `/review/session/${sessionId}`;
      }

      // Navigate back to the study page with the resumed session
      navigate(route, {
        state: {
          listInfo,
          resumedSession: sessionData,
        },
      });
    } catch (error) {
      console.error("Error resuming session:", error);
      toast("Failed to resume session", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    console.log("BatchSummaryPage - navigating to list with ID:", listId); // Debug log
    navigate(`/vocabulary/view/${listId}`);
  };

  const handleCompleteSession = async () => {
    try {
      setLoading(true);

      console.log("BatchSummaryPage - handleCompleteSession");
      console.log("- sessionId:", sessionId);
      console.log("- listId:", listId);
      console.log("- summary.listId:", summary?.listId);

      // End the session and get final summary
      const response = await reviewService.endSession(sessionId);
      const finalSummary = response.summary || response;

      // Ensure listId is included in summary
      if (finalSummary && !finalSummary.listId) {
        finalSummary.listId = listId;
      }

      console.log(
        "BatchSummaryPage - ending session, final summary:",
        finalSummary
      );
      toast("Study session completed!", "success");

      // Use listId from final summary (from backend) or fallback to URL params
      const targetListId = finalSummary.listId || listId;
      console.log(
        "BatchSummaryPage - navigating to summary with listId:",
        targetListId
      );
      console.log(
        "Available IDs - finalSummary.listId:",
        finalSummary.listId,
        "URL listId:",
        listId
      );

      // Navigate to session summary
      navigate(`/review/${targetListId}/summary`, {
        state: {
          summary: finalSummary,
          sessionId: sessionId,
          listId: targetListId, // Pass the actual listId
        },
      });
    } catch (error) {
      console.error("Error completing session:", error);
      toast("Failed to complete session", "error");
      // Fallback to back to list
      handleBackToList();
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    // No session data, redirect to vocabulary list
    useEffect(() => {
      navigate(`/vocabulary/view/${listId}`);
    }, [navigate, listId]);
    return null;
  }

  return (
    <div className="batch-summary-page">
      <Header />

      <div className="page-body">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />

        <main className="main-content">
          <BatchSummary
            summary={summary}
            onContinue={handleContinueReview}
            onBackToList={handleBackToList}
            onCompleteSession={handleCompleteSession}
            isLoading={loading}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}
