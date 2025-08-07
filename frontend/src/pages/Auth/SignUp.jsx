import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AccountPageInput from "../../components/Forms/AccountPageInput";
import MainPageLogo from "../../assets/Logo.svg";
import { GoogleLogo } from "../../assets/icons/index";
import authService from "../../services/Auth/authService";
import { SignInSignUpBG } from "../../assets/Auth";
import LoadingCursor from "../../components/UI/LoadingCursor";
import {
  handleSignupError,
  clearAuthErrors,
} from "../../utils/authErrorHandler";

const handleGoogleSignUp = () => {
  window.location.href =
    import.meta.env.VITE_GOOGLE_AUTH_URL ||
    "http://localhost:3000/api/auth/google";
};

export default function SignUp() {
  // Xử lý lỗi
  const [errors, setErrors] = useState({});

  // Xử lý việc điều hướng trang
  const navigate = useNavigate();

  // Xử lý cursor xoay khi bấm nút đăng nhập
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý xoá hết input khi đăng nhập sai
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearAuthErrors(setErrors);

    const newErrors = {};

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password)
    ) {
      newErrors.password =
        "Password must at least 8 characters, contain uppercase, lowercase and number";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "The repeated password does not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      clearForm();
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register({ email, password });

      // Store tokens if provided (user can navigate but has limited access until verified)
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data.refreshToken) {
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      }

      navigate("/checkYourMail", {
        state: {
          fromSignUp: true,
          email: email,
        },
      });
    } catch (error) {
      handleSignupError(error, setErrors, clearForm);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid-container">
      <LoadingCursor loading={isLoading} />
      <div className="left-grid">
        <Link to="/" className="signup-logo">
          <img src={MainPageLogo} alt="logo-page" />
        </Link>

        <div className="signup-container">
          <div className="signup-signup-container">
            <Link to="/signin" className="signup-signin-button">
              Sign in
            </Link>
            <Link to="" className="signup-signup-button">
              Sign up
            </Link>
          </div>

          <Link onClick={handleGoogleSignUp} className="signup-google">
            <img src={GoogleLogo} alt="google-logo" />
            Continue with Google account
          </Link>

          <form className="signup-form" onSubmit={handleSignUp}>
            <AccountPageInput
              label="Email:"
              name="email"
              type="text"
              placeholder="Enter your email"
              required
              error={errors.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <AccountPageInput
              label="Password:"
              name="password"
              type="password"
              placeholder="Enter password"
              required
              error={errors.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <AccountPageInput
              label="Enter the password again:"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              required
              error={errors.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <AccountPageInput
              type="submit"
              value={isLoading ? "Registering..." : "Sign up"}
              disabled={isLoading}
            />
          </form>

          {/* Back button  */}
          <div className="signup-back-button-container">
            <Link to="/" className="signup-back-button">
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="right-grid">
        <img src={SignInSignUpBG} alt="sign-in-sign-up-background" />
      </div>
    </div>
  );
}
