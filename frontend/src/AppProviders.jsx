import { StrictMode } from "react";
import { AuthProvider } from "./services/Auth/authContext.jsx";
import { ConfirmProvider } from "./components/ConfirmProvider.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function AppProviders({ children }) {
  return (
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <ConfirmProvider>
            <ToastProvider>{children}</ToastProvider>
          </ConfirmProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
