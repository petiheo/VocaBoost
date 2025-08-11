import { lazy, Suspense } from "react";

const ReviewWithSR = lazy(() => import("../pages/Review/ReviewWithSR"));
const StudyWithFlashcard = lazy(
  () => import("../pages/Review/StudyWithFlashcard")
);
const SessionSummary = lazy(() => import("../pages/Review/SessionSummary"));
const FillInBlankPage = lazy(() => import("../pages/Review/FillInBlankPage"));
const BatchSummaryPage = lazy(() => import("../pages/Review/BatchSummaryPage"));

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      fontSize: "1rem",
      color: "#666",
    }}
  >
    Loading review session...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const reviewRoutes = [
  {
    path: "/review/:listId",
    element: withSuspense(ReviewWithSR),
  },
  {
    path: "/review/:listId/flashcard",
    element: withSuspense(StudyWithFlashcard),
  },
  {
    path: "/review/:listId/fill-in-blank",
    element: withSuspense(FillInBlankPage),
  },
  {
    path: "/review/session/:sessionId",
    element: withSuspense(StudyWithFlashcard),
  },
  {
    path: "/review/session/:sessionId/fill-in-blank",
    element: withSuspense(FillInBlankPage),
  },
  {
    path: "/review/:listId/batch-summary",
    element: withSuspense(BatchSummaryPage),
  },
  {
    path: "/review/:listId/summary",
    element: withSuspense(SessionSummary),
  },
  {
    path: "/review/session/:sessionId/summary",
    element: withSuspense(SessionSummary),
  },
];

export default reviewRoutes;
