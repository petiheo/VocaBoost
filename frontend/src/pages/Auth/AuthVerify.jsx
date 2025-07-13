// Lý do: Sau khi đăng nhập, backend của bạn sẽ redirect người dùng tới: http://localhost:5173/auth/verify-email?token=<jwt_token>
//  Mà frontend (React) không thể tự xử lý token trong URL nếu bạn không có route /auth/success tương ứng.

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Lưu token
      localStorage.setItem("token", token);

      // (Tùy chọn) Giải mã token để lấy thông tin user
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem("user", JSON.stringify({
          id: payload.userId,
          email: payload.email,
          role: payload.role
        }));
      } catch {
        // Nếu token không decode được thì bỏ qua
        return; 
      }

      // Chuyển sang homepage/dashboard
      navigate("/homepage");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return <div>Authenticating..</div>;
}
