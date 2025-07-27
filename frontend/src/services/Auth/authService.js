import api from "../../lib/api";

const authService = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  //1.  Đăng nhập
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.data.user));
    return res.data;
  },

  // Login without storing tokens (for verification check)
  loginWithoutStorage: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  // Store user session after verification
  storeUserSession: (userData) => {
    localStorage.setItem("token", userData.data.token);
    localStorage.setItem("user", JSON.stringify(userData.data.user));
  },


  // 4. Đăng xuất
  logout: async () => {
    const token = localStorage.getItem("token");
    await api.post("/auth/logout", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // 5. Quên mật khẩu 
  forgotPassword: async (email) => {
    return await api.post("/auth/forgot-password", { email });
  },

  // 7. Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng thử lại từ liên kết đặt lại mật khẩu.");
    }
    const res = await api.post("/auth/reset-password", {
      token: token,
      newPassword: newPassword
    });
    return res.data;
  },

  // 8. Verify Email
  verifyEmail: async (token) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data; 
  },

  // 9. Get account status
  getAccountStatus: async (email) => {
    const res = await api.post("/auth/get-account-status", {email: email})
    return res.data; 
  },

  // 10. Resend verification email
  resendVerification: async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  getToken: () => localStorage.getItem("token"),
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    catch (e) {
      console.error("Lỗi khi parse user:", e);
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem("token")
};

export default authService;