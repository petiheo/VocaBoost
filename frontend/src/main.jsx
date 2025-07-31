import { Children, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./services/Auth/authContext.jsx";
import { ConfirmProvider } from "./components/ConfirmProvider.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import authRoutes from "./routes/AuthRoutes";
import vocabularyRoutes from "./routes/VocabularyRoutes.jsx";
import classroomRoutes from "./routes/ClassroomRoutes.jsx";


const router = createBrowserRouter([
  ...authRoutes,
  ...vocabularyRoutes,
  ...classroomRoutes,
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ConfirmProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ConfirmProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
