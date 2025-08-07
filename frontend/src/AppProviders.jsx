import { StrictMode } from "react";
import PropTypes from "prop-types";
import { AuthProvider } from "./services/Auth/authContext.jsx";
import { ConfirmProvider } from "./components/Providers/ConfirmProvider.jsx";
import { ToastProvider } from "./components/Providers/ToastProvider.jsx";
import ErrorBoundary from "./components/Providers/ErrorBoundary.jsx";

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

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};
