// Lý do: Sau khi đăng nhập bằng Google, backend của bạn sẽ redirect người dùng tới: http://localhost:5173/auth/success?token=<jwt_token>
//  Mà frontend (React) không thể tự xử lý token trong URL nếu bạn không có route /auth/success tương ứng.

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../services/Auth/authContext";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";

    if (token) {
      // Lưu token
      localStorage.setItem("token", token);

      // Giải mã token để lấy thông tin user
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData); // Update auth context
        
        console.log("Google OAuth user:", payload.userId, payload.email, payload.role, "isNewUser:", isNewUser);
        
        // Điều hướng dựa trên trạng thái user từ URL parameter
        if (isNewUser) {
          // User mới → chuyển đến select-user-type
          navigate("/select-user-type");
        } else {
          // User đã tồn tại → chuyển đến homepage
          navigate("/homepage");
        }
      } catch (error) {
        // Nếu token không decode được thì bỏ qua
        console.log("Không decode được token:", error);
        navigate("/signin");
        return; 
      }
    } else {
      navigate("/signin");
    }
  }, [searchParams, navigate]);

  return <div>Authenticating via Google...</div>;
}
