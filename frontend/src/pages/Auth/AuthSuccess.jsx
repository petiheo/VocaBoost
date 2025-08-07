// Lý do: Sau khi đăng nhập bằng Google, backend của bạn sẽ redirect người dùng tới: http://localhost:5173/auth/success?token=<jwt_token>
//  Mà frontend (React) không thể tự xử lý token trong URL nếu bạn không có route /auth/success tương ứng.

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../services/Auth/authContext";
import authService from "../../services/Auth/authService";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");
      const isNewUser = searchParams.get("isNewUser") === "true";

      if (token) {
        // Store both tokens
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        try {
          // Validate token with server instead of client-side decoding
          const validation = await authService.validateToken();

          if (validation && validation.success) {
            const userObject = validation.data;
            // Store token and user manually since validateToken doesn't return the same structure as login
            localStorage.setItem("user", JSON.stringify(userObject));
            setUser(userObject);

            // Navigate based on user status
            if (isNewUser) {
              navigate("/select-user-type");
            } else {
              navigate("/homepage");
            }
          } else {
            throw new Error("Token validation failed");
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          navigate("/signin");
        }
      } else {
        navigate("/signin");
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, setUser]);

  return <div>Authenticating via Google...</div>;
}
