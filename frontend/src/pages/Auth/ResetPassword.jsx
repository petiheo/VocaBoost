import { useState, useEffect } from "react";
import authService from "../../services/Auth/authService";
import AccountPageInput from "../../components/AccountPageInput"

export default function ResetPassword() {
  console.log("ResetPassword component rendered");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState("");

  // Lấy token từ URL parameters
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const resetToken = query.get("token");
    if (resetToken) {
      setToken(resetToken);
    } else {
      setErrorMessage("Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.");
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.");
      return;
    }

    try {
      const res = await authService.resetPassword(token, password);
      setSuccessMessage(res.message || "Đặt lại mật khẩu thành công!");
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.message ||
        "Lỗi không xác định khi đặt lại mật khẩu";
      setErrorMessage(msg);
    }
  };


  return (
    <div className="reset">
      <form className="reset__form" onSubmit={handleReset}>
        <div className="reset-your-password">Reset your password</div>

        <AccountPageInput
          label="Enter your new password:"
          name="new-password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
