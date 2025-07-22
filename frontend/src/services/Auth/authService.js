import api from "../../lib/api";

const authService = {
  register: async (data) => {
    const res = await api.post("/auth/register", data); //  FIX
    return res.data;
  },

  //1.  Đăng nhập
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password }); //  FIX
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
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
    return await api.post("/auth/forgot-password", { email }); //  FIX
  },

  // 7. Đặt lại mật khẩu
  resetPassword: async (newPassword) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng thử lại từ liên kết đặt lại mật khẩu.");
    }
    const res = await api.post("/auth/reset-password", {
      token: token,
      newPassword: newPassword
    });
    return res.data;
  },

  // 9. Get account status
  getAccountStatus: async (email) => {
    const res = await api.post("/auth/get-account-status", {email: email})
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