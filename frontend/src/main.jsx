import { Children, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./services/Auth/authContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import authRoutes from "./routes/AuthRoutes";
import classroomRoutes from "./routes/ClassroomRoutes.jsx";


const router = createBrowserRouter([
  ...authRoutes,
  ...classroomRoutes,
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
