import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../services/Auth/authContext.jsx";

export const useEmailVerificationRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Only check for unverified users who are logged in
    if (!user) return;

    const pendingVerification = sessionStorage.getItem(
      "pendingEmailVerification"
    );
    const userEmail = sessionStorage.getItem("userEmail");

    // Don't redirect if already on verification-related pages
    const isOnVerificationPage = [
      "/checkYourMail",
      "/signin",
      "/signup",
      "/auth/verify-email",
    ].some((path) => location.pathname.startsWith(path));

    if (pendingVerification === "true" && userEmail && !isOnVerificationPage) {
      // Clear the pending flag and navigate
      sessionStorage.removeItem("pendingEmailVerification");
      navigate("/checkYourMail", {
        state: {
          fromUnverified: true,
          email: userEmail,
        },
        replace: true,
      });
    }
  }, [navigate, location.pathname, user]);
};

export default useEmailVerificationRedirect;
