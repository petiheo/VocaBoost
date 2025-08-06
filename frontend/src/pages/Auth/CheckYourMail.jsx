import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../../services/Auth/authService";

import { SignUpElement } from "../../assets/icons/index"
import SignUpBackground from "../../assets/icons/SignUp/SignUpBackground.svg";

export default function CheckYourMail() {
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [resendError, setResendError] = useState("");
    
    // Check if user came from sign-up or unverified login
    const isFromSignUp = location.state?.fromSignUp || false;
    const isFromUnverified = location.state?.fromUnverified || false;
    
    useEffect(() => {
        // Get email from location state or localStorage
        const userEmail = location.state?.email || authService.getCurrentUser()?.email || "";
        setEmail(userEmail);
    }, [location.state]);

    const handleResendVerification = async () => {
        if (!email) {
            setResendError("Email not found. Please try signing in again.");
            return;
        }

        setIsResending(true);
        setResendMessage("");
        setResendError("");

        try {
            await authService.resendVerification(email);
            setResendMessage("Verification email sent successfully! Please check your inbox.");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to resend verification email. Please try again.";
            setResendError(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="check-your-mail-container"
            style={{
                backgroundImage: `url(${SignUpBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
            }}>
            <div className="sign-up-successfully">
                {isFromSignUp ? "Sign up successfully" : isFromUnverified ? "Email verification required" : "Email verification required"}
            </div>
            <div className="check-your-mail">Check your mail!</div>
            
            {email && (
                <div className="email-info">
                    Verification email sent to: <strong>{email}</strong>
                </div>
            )}
            
            <div className="resend-section">
                <p>
                    Didn't receive the email?{" "}
                    <span 
                        onClick={handleResendVerification}
                        className={`resend-link ${(isResending || !email) ? 'disabled' : ''}`}
                    >
                        {isResending ? "Sending..." : "Resend verification email"}
                    </span>
                </p>
                
                {resendMessage && (
                    <div className="resend-success">{resendMessage}</div>
                )}
                
                {resendError && (
                    <div className="resend-error">{resendError}</div>
                )}
            </div>
            
            <Link to="/signin" className="go-to-sign-in"> Go to sign in </Link>
            <img src={SignUpElement} alt="sign-up-element" className="sign-up-element" width="55%"  />
        </div>
    )
}