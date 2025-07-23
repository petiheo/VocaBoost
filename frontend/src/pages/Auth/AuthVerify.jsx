// Lý do: Sau khi đăng nhập, backend của bạn sẽ redirect người dùng tới: http://localhost:5173/auth/verify-email?token=<jwt_token>
//  Mà frontend (React) không thể tự xử lý token trong URL nếu bạn không có route /auth/success tương ứng.

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../../services/Auth/authService";
import { useAuth } from "../../services/Auth/authContext";

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    
    // Dùng để kiểm tra useEffect chạy 2 lần do StrictMode 
    if (hasRun.current) return;
    hasRun.current = true;
    const token = searchParams.get("token");

    const handleVerification = async () => {
      if (token) {
        // Lưu token
        localStorage.setItem("token", token);

        // (Tùy chọn) Giải mã token để lấy thông tin user
        try {
          // Gọi API verify từ authService
          const result = await authService.verifyEmail(token);

          if (!result.success) {
            throw new Error(result.error || "Email verification failed");
          }

          // Decode để lấy thông tin user
          try {
            // Chưa kiểm tra phần decode
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: payload.userId,
              email: payload.email,
              role: payload.role
            })

            localStorage.setItem("user", JSON.stringify({
              id: payload.userId,
              email: payload.email,
              role: payload.role
            }));
            console.log(payload.id, payload.email, payload.role);
          } catch {
            console.log("Không decode được token");
          }

          // Chuyển sang homepage/dashboard
          navigate("/select-user-type");
        } catch (error) {
          console.log(error.message);
          navigate("/signin");
        }
      }
    }
    handleVerification();
  }, [searchParams]);

  return <div>Authenticating..</div>;
}
