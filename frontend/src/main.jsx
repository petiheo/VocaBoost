import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppProviders from "./AppProviders.jsx";

import authRoutes from "./routes/AuthRoutes";
import vocabularyRoutes from "./routes/VocabularyRoutes.jsx";
import classroomRoutes from "./routes/ClassroomRoutes.jsx";
import userRoutes from "./routes/UserRoutes.jsx";
import devRoutes from "./routes/DevRoutes.jsx";
import reviewRoutes from "./routes/Review.Routes.jsx";
import adminRoutes from "./routes/AdminRoutes.jsx";

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.2rem",
      color: "#666",
    }}
  >
    Loading...
  </div>
);

const router = createBrowserRouter([
  ...authRoutes,
  ...vocabularyRoutes,
  ...classroomRoutes,
  ...userRoutes,
  ...devRoutes,
  ...reviewRoutes,
  ...adminRoutes,
]);

createRoot(document.getElementById("root")).render(
  <AppProviders>
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  </AppProviders>
);
