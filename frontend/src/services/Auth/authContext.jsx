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
        const checkUserSession = async () => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                try {
                    // Check if user's email is verified
                    const accountStatus = await authService.getAccountStatus(currentUser.email);
                    console.log('account status:::', accountStatus);
                    
                    if (accountStatus?.data?.emailVerified) {
                        setUser(currentUser);
                    } else {
                        // Clear session for unverified users
                        await authService.logout();
                        setUser(null);
                    }
                } catch (error) {
                    // If there's an error checking status, clear the session
                    await authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserSession();
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
