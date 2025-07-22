import "../../assets/icons/index";
import { Link } from "react-router-dom";
import AccountPageInput from "../../components/AccountPageInput"
import MainPageLogo from "../../assets/Logo.svg";
import { GoogleLogo } from "../../assets/icons/index";
import { useNavigate } from 'react-router-dom' // Import useNavigate for navigation
import authService from "../../services/Auth/authService";
import { SignInSignUpBG } from "../../assets/Auth";
import { useState } from "react";
import LoadingCursor from "../../components/cursor/LoadingCursor";



export default function Login() {
    // Xử lý việc navigate trang
    const navigate = useNavigate();

    // Xử lý cursor xoay khi bấm nút đăng nhập 
    const [isLoading, setIsLoading] = useState(false);

    // Xử lý việc đăng nhập 
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        setIsLoading(true);
        try {
            const res = await authService.login(email, password);
            const check = await authService.getAccountStatus(email);
            if (check?.data?.emailVerified)
                navigate("/homepage");
            else
                navigate("/checkYourMail")
        } catch (error) {
            alert(error.response?.data?.error || "Incorrect email or password!");
        } finally {
            setIsLoading(false);
        }
    };

    // Đăng nhập bằng google
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/api/auth/google";
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
                        />

                        <AccountPageInput
                            label="Password:"
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            required
                        />

                        <div className="login-forgot-password">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        <AccountPageInput type="submit" value="Sign in" />

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