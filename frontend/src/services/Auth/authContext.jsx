// Dùng để quản lý trạng thái đăng nhập toàn cục, lưu thông tin người dùng sau khi đăng nhập
// Cho phép mọi component (ví dụ: Header, ProfilePage, Dashboard) dùng useAuth() để truy cập dữ liệu người dùng.
// Tránh truyền đi truyền lại user nhiều lần
import { createContext, useContext, useEffect, useState } from "react";
import authService from "./authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          // Check if user's email is verified
          const accountStatus = await authService.getAccountStatus(
            currentUser.email
          );
          console.log("account status:::", accountStatus);

          if (accountStatus?.data?.emailVerified) {
            setUser(currentUser);
          } else {
            // Keep user session but mark as unverified for navigation handling
            setUser({ ...currentUser, emailVerified: false });
            sessionStorage.setItem("pendingEmailVerification", "true");
            sessionStorage.setItem("userEmail", currentUser.email);
          }
        } catch (error) {
          // If there's an error checking status, keep user but mark for redirect
          console.warn("Error checking account status:", error);
          setUser({ ...currentUser, emailVerified: false });
          sessionStorage.setItem("pendingEmailVerification", "true");
          sessionStorage.setItem("userEmail", currentUser.email);
        }
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
      // Store reason for manual logout
      sessionStorage.setItem("logoutReason", "manual");
    } catch (e) {
      console.warn("Logout error, but will continue:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading ? children : <div>Fetching user data... </div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
