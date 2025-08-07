import { ReviewWithSR, StudyWithFlashcard, SessionSummary, FillInBlankPage } from "../pages/Review";
import BatchSummaryPage from "../pages/Review/BatchSummaryPage";

const reviewRoutes = [
  {
    path: "/review/:listId",
    element: <ReviewWithSR />,
  },
  {
    path: "/review/:listId/flashcard",
    element: <StudyWithFlashcard />,
  },
  {
    path: "/review/:listId/fill-in-blank",
    element: <FillInBlankPage />,
  },
  {
    path: "/review/session/:sessionId",
    element: <StudyWithFlashcard />,
  },
  {
    path: "/review/session/:sessionId/fill-in-blank",
    element: <FillInBlankPage />,
  },
  {
    path: "/review/:listId/batch-summary",
    element: <BatchSummaryPage />,
  },
  {
    path: "/review/:listId/summary",
    element: <SessionSummary />,
  },
  {
    path: "/review/session/:sessionId/summary",
    element: <SessionSummary />,
  },
];

export default reviewRoutes;