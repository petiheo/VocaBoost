import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AccountPageInput from "../../components/AccountPageInput"
import MainPageLogo from "../../assets/Logo.svg";
import { GoogleLogo } from "../../assets/icons/index";
import authService from "../../services/Auth/authService";


const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
};

export default function SignUp() {

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        const newErrors = {};

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            newErrors.password = "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters!";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "The repeated password does not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await authService.register({ email, password });
            navigate("/checkYourMail");
        } catch (error) {
            setErrors({ server: error.response?.data?.error || "Registration error." });
            console.error(error);
        }
    };


    return (
        <div className="grid-container">
            <div className="left-grid">
                <Link to="/" className="signup-logo">
                    <img src={MainPageLogo} alt="logo-page" />
                </Link>

                <div className="signup-container">

                    <div className="signup-signup-container">
                        <Link to="/signin" className="signup-signup-button">Sign in</Link>
                        <Link to="" className="signup-signup-button">Sign up</Link>
                    </div>

                    <Link onClick={handleGoogleSignUp} className="signup-google">
                        <img src={GoogleLogo} alt="google-logo" />
                        Continue with Google account
                    </Link>


                    <form className="signup-form" onSubmit={handleSignUp}>
                        <AccountPageInput
                            label="Email:" name="email" type="text" placeholder="Enter your email" required
                        />

                        <AccountPageInput
                            label="Password:"
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            required
                            error={errors.password}
                        />

                        <AccountPageInput
                            label="Enter the password again:"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repeat password"
                            required
                            error={errors.confirmPassword}
                        />

                        <AccountPageInput type="submit" value="Sign up" />
                    </form>


                    {/* Back button  */}
                    <div className="signup-back-button-container">
                        <Link to="/" className="signup-back-button">Back</Link>
                    </div>
                </div>
            </div>

            <div className="right-grid">

            </div>
        </div>
    );
}