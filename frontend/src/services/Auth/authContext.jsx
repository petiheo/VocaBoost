// Dùng để quản lý trạng thái đăng nhập toàn cục, lưu thông tin người dùng sau khi đăng nhập 
// Cho phép mọi component (ví dụ: Header, ProfilePage, Dashboard) dùng useAuth() để truy cập dữ liệu người dùng.
// Tránh truyền đi truyền lại user nhiều lần
import { createContext, useState, useEffect, useContext } from "react";
import authService from "./authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) setUser(currentUser);
        setLoading(false);
    }, []);

    const logout = async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.warn("Logout error, but will continue:", e);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
