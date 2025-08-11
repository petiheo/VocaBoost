import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/Auth/authContext";
import { canAccessAdminRoutes } from "../../utils/navigationUtils";

/**
 * Protected route component for admin-only pages
 * Redirects non-admin users to homepage
 */
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to signin
      if (!user) {
        navigate("/signin");
        return;
      }

      // If user doesn't have admin access, redirect to homepage
      if (!canAccessAdminRoutes(user)) {
        navigate("/homepage");
        return;
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
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
        Checking permissions...
      </div>
    );
  }

  // If user is not authenticated or not admin, don't render children
  if (!user || !canAccessAdminRoutes(user)) {
    return null;
  }

  // User is authenticated and has admin access, render the protected content
  return children;
};

export default ProtectedAdminRoute;
