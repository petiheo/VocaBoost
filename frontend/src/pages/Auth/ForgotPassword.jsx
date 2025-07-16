import { useState } from "react";
import authService from "../../services/Auth/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.forgotPassword(email);
      alert(res.message || "Đã gửi email đặt lại mật khẩu!");
    } catch (error) {
      alert(error.response?.data?.error || "Lỗi gửi email");
    }
  };

  return (
    <div className="forgot">
    <form className="forgot__form" onSubmit={handleSend}>
        <h2>Forgot your password?</h2>

        <label htmlFor="email">Enter your email:</label>
        <input
        id="email"
        type="email"
        placeholder="example@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        />
        <button type="submit">Submit</button>
    </form>
    </div>
  );
}
