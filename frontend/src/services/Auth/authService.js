import api from "../../lib/api";

const authService = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  //1. Đăng nhập
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
    await api.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
      throw new Error(
        "Token không tồn tại. Vui lòng thử lại từ liên kết đặt lại mật khẩu."
      );
    }
    const res = await api.post("/auth/reset-password", {
      token: token,
      newPassword: newPassword,
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
    const res = await api.post("/auth/get-account-status", { email: email });
    return res.data;
  },

  // 10. Resend verification email
  resendVerification: async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  // Validate token with server
  validateToken: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await api.get("/auth/validate-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      // Token is invalid, clear it and redirect
      authService.clearSession();
      return null;
    }
  },

  // Enhanced session management
  clearSession: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Only redirect if not already on auth pages
    const currentPath = window.location.pathname;
    if (
      !currentPath.startsWith("/signin") &&
      !currentPath.startsWith("/signup") &&
      !currentPath.startsWith("/forgot-password") &&
      !currentPath.startsWith("/auth/")
    ) {
      window.location.href = "/signin";
    }
  },

  // Check if token is expired (client-side check)
  isTokenExpired: () => {
    const token = localStorage.getItem("token");
    if (!token) return true;

    try {
      // Decode JWT payload (basic check - not cryptographically secure)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      // Check if token is expired with 5 minute buffer
      return payload.exp && payload.exp - 300 < currentTime;
    } catch (error) {
      // If we can't decode the token, assume it's valid and let server validate
      // This prevents clearing sessions during OAuth flows with different token formats
      return false;
    }
  },

  getToken: () => localStorage.getItem("token"),
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem("token"),
};

export default authService;
