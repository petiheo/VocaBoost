import { useState } from "react";
import authService from "../../services/Auth/authService";
import AccountPageInput from "../../components/AccountPageInput";
import LoadingCursor from "../../components/cursor/LoadingCursor";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.data?.message || "We've sent you a password reset link. Please check your inbox.");
      setEmail(""); // Clear email after successful submission
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Oops! Something went wrong while sending the email. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot">
      <LoadingCursor loading={isLoading} />
      <form className="forgot__form" onSubmit={handleSend}>
        <h2>Forgot your password?</h2>

        <AccountPageInput
          label="Enter your email:"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          error={error}
        />

        {/* Success Message */}
        {success && (
          <div className="forgot__success">
            {success}
          </div>
        )}
        
        <AccountPageInput 
          type="submit" 
          value={isLoading ? "Submitting..." : "Submit"}
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
