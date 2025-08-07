import api from "../../lib/api";

// Token expiration cache
let tokenExpirationCache = {
  token: null,
  expiry: null,
  isExpired: true,
  lastChecked: null
};

const authService = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  //1. Đăng nhập
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.data.token);
    localStorage.setItem("refreshToken", res.data.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(res.data.data.user));
    // Clear cache when new token is set
    tokenExpirationCache.token = null;
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
    localStorage.setItem("refreshToken", userData.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData.data.user));
    // Clear cache when new token is set
    tokenExpirationCache.token = null;
  },

  // 4. Đăng xuất
  logout: async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    await api.post(
      "/auth/logout",
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Clear cache on logout
    tokenExpirationCache.token = null;
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
  clearSession: (showNotification = false, reason = 'logout') => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Clear token cache
    tokenExpirationCache.token = null;

    // Store logout reason in sessionStorage for notification
    if (showNotification) {
      sessionStorage.setItem("logoutReason", reason);
    }

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

  // Check if token is expired (client-side check with caching)
  isTokenExpired: () => {
    const token = localStorage.getItem("token");
    if (!token) return true;

    const currentTime = Date.now();

    // Check if we have valid cache for this token
    if (
      tokenExpirationCache.token === token &&
      tokenExpirationCache.lastChecked &&
      currentTime - tokenExpirationCache.lastChecked < 60000 // Cache for 1 minute
    ) {
      return tokenExpirationCache.isExpired;
    }

    try {
      // Decode JWT payload (basic check - not cryptographically secure)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTimeSeconds = currentTime / 1000;

      // Check if token is expired with 5 minute buffer
      const isExpired = payload.exp && payload.exp - 300 < currentTimeSeconds;

      // Update cache
      tokenExpirationCache = {
        token,
        expiry: payload.exp,
        isExpired,
        lastChecked: currentTime
      };

      return isExpired;
    } catch (error) {
      // If we can't decode the token, assume it's valid and let server validate
      // This prevents clearing sessions during OAuth flows with different token formats
      tokenExpirationCache = {
        token,
        expiry: null,
        isExpired: false,
        lastChecked: currentTime
      };
      return false;
    }
  },

  getToken: () => localStorage.getItem("token"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },
  
  isAuthenticated: () => !!localStorage.getItem("token"),
  
  // Refresh the access token using refresh token
  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      
      const res = await api.post("/auth/refresh-token", { refreshToken });
      
      if (res.data.success) {
        const newToken = res.data.data.token;
        localStorage.setItem("token", newToken);
        // Clear token cache to force re-validation
        tokenExpirationCache.token = null;
        return newToken;
      }
      
      throw new Error("Failed to refresh token");
    } catch (error) {
      // If refresh fails, clear session
      authService.clearSession(true, 'expired');
      throw error;
    }
  },
};

export default authService;
