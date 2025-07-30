import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/Auth/authService";
import AccountPageInput from "../../components/AccountPageInput";
import LoadingCursor from "../../components/cursor/LoadingCursor";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  // Get token from URL parameters
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const resetToken = query.get("token");
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError("Invalid token. Please request a new password reset.");
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!token) {
      setError("Invalid token. Please request a new password reset.");
      setIsLoading(false);
      return;
    }

    // Password validation
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setError("Password must at least 8 characters, contain uppercase, lowercase and number");
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.resetPassword(token, password);
      setSuccess(res.data?.message || "Password reset successfully! Redirecting to login page...");
      setPassword(""); // Clear password after success
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error resetting password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="reset">
      <LoadingCursor loading={isLoading} />
      <form className="reset__form" onSubmit={handleReset}>
        <h2>Reset your password</h2>

        <AccountPageInput
          label="Enter your new password:"
          name="new-password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Success Message */}
        {success && (
          <div className="reset__success">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="reset__error">
            {error}
          </div>
        )}

        <AccountPageInput
          type="submit"
          value={isLoading ? "Resetting..." : "Reset Password"}
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
