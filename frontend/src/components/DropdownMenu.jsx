import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom"
import { DropDownMenuPattern1, DropDownMenuPattern2, DropDownMenuPattern3 } from "../assets/icons/index"
import authService from "../services/Auth/authService";
import { useAuth } from "../services/Auth/authContext";

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null); // bien dung de theo doi phan tu dropdown 
    const navigate = useNavigate();

    const { user, logout: contextLogout } = useAuth();

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Hieu ung dropdown Menu
    useEffect(() => {
        const handleClickOutSide = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        // Thêm event listener khi component mount
        document.addEventListener('mousedown', handleClickOutSide);
        return () => {
            // Cleanup event listener khi component unmount
            document.removeEventListener('mousedown', handleClickOutSide)
        }
    }, [isOpen]);

    // BE: Xu ly logout 
    const handleLogOut = async () => {
        try {
            await authService.logout();
            contextLogout();
            navigate("/mainpage");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (

        <div className="dropdown__container" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="dropdown__trigger">
                {user?.avatarUrl ?
                    (<img src={user.avatarUrl} alt="Avatar" className="avatar-img" /> // Dung hinh anh 
                    ) : (
                        <span className="avatar-placeholder"> 
                            {user?.email?.charAt(0).toUpperCase() || "?"} 
                        </span> // dung chu cai dau cua email 
                    )}
            </button>

            {isOpen && (
                <div className="dropdown__content">
                    <Link to="/homepage" className="dropdown__item">
                        My Profile
                        <img src={DropDownMenuPattern1} alt="drop-down-menu-pattern1" className="drop-down-menu-pattern1" />
                    </Link>
                    {/* <Link to="/homepage" className="dropdown__item">
                        Setting
                        <img src={DropDownMenuPattern1} alt="drop-down-menu-pattern1" className="drop-down-menu-pattern1" />
                    </Link> */}
                    <img src={DropDownMenuPattern3} alt="drop-down-menu-pattern3" className="drop-down-menu-pattern3" />
                    <button onClick={handleLogOut} className="dropdown__item">
                        Log out
                        <img src={DropDownMenuPattern2} alt="drop-down-menu-pattern2" className="drop-down-menu-pattern1" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;