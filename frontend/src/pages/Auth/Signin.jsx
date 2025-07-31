import "../../assets/icons/index";
import { Link } from "react-router-dom";
import AccountPageInput from "../../components/AccountPageInput"
import MainPageLogo from "../../assets/Logo.svg";
import { GoogleLogo } from "../../assets/icons/index";
import { useNavigate } from 'react-router-dom' // Import useNavigate for navigation
import authService from "../../services/Auth/authService";
import { SignInSignUpBG } from "../../assets/Auth";
import { useState, useEffect } from "react";
import LoadingCursor from "../../components/cursor/LoadingCursor";
import { useAuth } from "../../services/Auth/authContext";
import { handleLoginError, clearAuthErrors } from "../../utils/authErrorHandler";
import { useToast } from "../../components/ToastProvider";



export default function Signin() {
    // Xử lý việc navigate trang
    const navigate = useNavigate();

    // Xử lý cursor xoay khi bấm nút đăng nhập 
    const [isLoading, setIsLoading] = useState(false);

    // Xử lý lỗi khi đăng nhập 
    const [errors, setErrors] = useState({});

    // Xử lý dữ liệu người dùng. 
    const { setUser } = useAuth();

    // Xử lý xoá hết input khi đăng nhập sai 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Toast notification
    const showToast = useToast();

    // Check for logout notifications on component mount
    useEffect(() => {
        const logoutReason = sessionStorage.getItem("logoutReason");
        if (logoutReason) {
            let message = "";
            switch (logoutReason) {
                case "manual":
                    message = "You have been successfully logged out.";
                    showToast(message, "success");
                    break;
                case "expired":
                    message = "Your session has expired. Please log in again.";
                    showToast(message, "error");
                    break;
                case "unauthorized":
                    message = "Your session is invalid. Please log in again.";
                    showToast(message, "error");
                    break;
                case "unverified":
                    message = "Please verify your email address before logging in.";
                    showToast(message, "error");
                    break;
                case "verification_error":
                    message = "Unable to verify account status. Please try again.";
                    showToast(message, "error");
                    break;
                default:
                    break;
            }
            // Clear the logout reason after showing notification
            sessionStorage.removeItem("logoutReason");
        }
    }, [showToast]);

    const clearForm = () => {
        setEmail("");
        setPassword("");
    };

    // Xử lý việc đăng nhập 
    const handleLogin = async (e) => {
        e.preventDefault();
        clearAuthErrors(setErrors);

        setIsLoading(true);
        try {
            // First check if email is verified without storing tokens
            const res = await authService.loginWithoutStorage(email, password);
            const check = await authService.getAccountStatus(email);
            
            if (check?.data?.emailVerified) {
                // Only store tokens for verified users
                authService.storeUserSession(res);
                setUser(res?.data?.user);
                navigate("/homepage");
            } else {
                // Don't store tokens for unverified users
                navigate("/checkYourMail", { 
                    state: { 
                        fromSignUp: false, 
                        email: email 
                    } 
                });
            }
        } catch (error) {
            handleLoginError(error, setErrors, clearForm);
        } finally {
            setIsLoading(false);
        }
    };

    // Đăng nhập bằng google
    const handleGoogleLogin = () => {
        window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL || "http://localhost:3000/api/auth/google";
    };

    return (
        <div className="grid-container">
            {/* Xử lý cursor */}
            <LoadingCursor loading={isLoading} />
            <div className="left-grid">
                <Link to="/" className="login-logo">
                    <img src={MainPageLogo} alt="logo-page" />
                </Link>

                <div className="login-container">

                    <div className="login-signup-container">
                        <Link to="" className="login-login-button">Sign in</Link>
                        <Link to="/signup" className="login-signup-button">Sign up</Link>
                    </div>

                    <Link onClick={handleGoogleLogin} className="login-google">
                        <img src={GoogleLogo} alt="google-logo" />
                        Sign in with Google account
                    </Link>


                    <form className="login-form" onSubmit={handleLogin}>
                        <AccountPageInput
                            label="Email:"
                            name="email"
                            type="text"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <AccountPageInput
                            label="Password:"
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            required
                            error={errors.login}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="login-forgot-password">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        <AccountPageInput 
                            type="submit" 
                            value={isLoading ? "Signing in..." : "Sign in"}
                            disabled={isLoading}
                        />

                    </form>


                    {/* Back button  */}
                    <div className="login-back-button-container">
                        <Link to="/" className="login-back-button">Back</Link>
                    </div>
                </div>
            </div>

            <div className="right-grid">
                <img src={SignInSignUpBG} alt="sign-in-sign-up-background" />
            </div>
        </div>
    );
}