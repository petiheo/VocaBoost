// Lý do: Sau khi đăng nhập, backend của bạn sẽ redirect người dùng tới: http://localhost:5173/auth/verify-email?token=<jwt_token>
//  Mà frontend (React) không thể tự xử lý token trong URL nếu bạn không có route /auth/success tương ứng.

import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/Auth/authService";
import { useAuth } from "../../services/Auth/authContext";

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const hasRun = useRef(false);

  useEffect(() => {
    // Dùng để kiểm tra useEffect chạy 2 lần do StrictMode
    if (hasRun.current) return;
    hasRun.current = true;
    const token = searchParams.get("token");

    const handleVerification = async () => {
      if (token) {
        try {
          // Call API verify from authService
          const result = await authService.verifyEmail(token);

          if (!result.success) {
            throw new Error(result.message || "Email verification failed");
          }

          // After successful email verification, the backend should provide session tokens
          if (result.data && result.data.token) {
            // Store both access and refresh tokens provided by the backend
            localStorage.setItem("token", result.data.token);
            if (result.data.refreshToken) {
              localStorage.setItem("refreshToken", result.data.refreshToken);
            }

            // Store user data if provided
            if (result.data.user) {
              const userData = result.data.user;
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            }

            // Clear pending email verification flags
            sessionStorage.removeItem("pendingEmailVerification");
            sessionStorage.removeItem("userEmail");

            // Navigate to select user type
            navigate("/select-user-type");
          } else {
            // If no session token is provided, try to validate the verification token
            localStorage.setItem("token", token);

            try {
              const validation = await authService.validateToken();

              if (validation && validation.success) {
                const userData = validation.data.user;
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));

                // Clear pending email verification flags
                sessionStorage.removeItem("pendingEmailVerification");
                sessionStorage.removeItem("userEmail");

                navigate("/select-user-type");
              } else {
                throw new Error("Token validation failed");
              }
            } catch (error) {
              console.error("Token validation failed:", error);
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              navigate("/signin");
            }
          }
        } catch (error) {
          console.error("Email verification failed:", error);
          navigate("/signin");
        }
      }
    };
    handleVerification();
  }, [searchParams]);

  return <div>Authenticating..</div>;
}
