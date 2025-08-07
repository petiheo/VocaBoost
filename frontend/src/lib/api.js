import axios from "axios";

const api = axios.create({
  baseURL: `${
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  }/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Import authService dynamically to avoid circular dependency
let authService;
import("../services/Auth/authService.js").then((module) => {
  authService = module.default;
});

// Request interceptor with token validation
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("API Request - URL:", config.url, "Token exists:", !!token); // Debug log
    
    if (token) {
      // Skip token expiration check for auth endpoints and during OAuth flow
      const isAuthEndpoint =
        config.url?.includes("/auth/validate-token") ||
        config.url?.includes("/auth/verify-email") ||
        config.url?.includes("/auth/logout") ||
        config.url?.includes("/auth/get-account-status");

      // Check if token is expired before making request (except for auth endpoints)
      if (!isAuthEndpoint && authService && authService.isTokenExpired()) {
        authService.clearSession(true, "expired");
        return Promise.reject(new Error("Token expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("API Request - No token found in localStorage"); // Debug log
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration or invalid token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh for auth endpoints
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      // Try to refresh the token
      if (authService && authService.refreshAccessToken) {
        try {
          const newToken = await authService.refreshAccessToken();
          
          // Update the authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, session cleanup already handled in refreshAccessToken
          return Promise.reject(refreshError);
        }
      } else {
        // Fallback if authService not loaded yet
        sessionStorage.setItem("logoutReason", "unauthorized");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        const currentPath = window.location.pathname;
        if (
          !currentPath.startsWith("/signin") &&
          !currentPath.startsWith("/signup") &&
          !currentPath.startsWith("/forgot-password") &&
          !currentPath.startsWith("/auth/")
        ) {
          window.location.href = "/signin";
        }
      }
    }

    // Handle server errors silently in production
    if (
      error.response?.status >= 500 &&
      import.meta.env.MODE === "development"
    ) {
      console.error("Server error:", error.response.data);
    }

    // Don't log expected 404 errors for review endpoints (no due words)
    if (
      error.response?.status === 404 &&
      error.config?.url?.includes('/review/') &&
      error.response?.data?.message?.includes('No words are currently due for review')
    ) {
      // This is an expected behavior, not an error to log
      return Promise.reject(error);
    }

    // Handle network errors silently in production
    if (
      (error.code === "NETWORK_ERROR" || error.message === "Network Error") &&
      import.meta.env.MODE === "development"
    ) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
