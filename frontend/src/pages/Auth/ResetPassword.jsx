import { useState, useEffect } from "react";
import authService from "../../services/Auth/authService";
import AccountPageInput from "../../components/AccountPageInput"

export default function ResetPassword() {
  console.log("ResetPassword component rendered");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Lấy token từ URL và lưu vào localStorage
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    if (token) {
      localStorage.setItem("token", token);
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await authService.resetPassword(password);
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
