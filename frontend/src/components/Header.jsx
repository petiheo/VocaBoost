import { Link } from "react-router-dom";
import MainPageLogo from "../assets/Logo.svg";
import SearchBar from "./SearchBar.jsx";
import DropdownMenu from "./DropdownMenu.jsx";
import { useAuth } from "../services/Auth/authContext.jsx";
import { Bell, Plus } from "../assets/Auth/index.jsx";

const Header = ({ searchQuery, onSearchChange }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return (
        <nav className="header">
            {/* Logo */}
            {user ? (
                <Link to="/homepage" className="header__site-title">
                    <img src={MainPageLogo} alt="Vocaboost Logo" className="header-logo" />
                </Link>
            ) : (
                <Link to="/" className="header__site-title">
                    <img src={MainPageLogo} alt="Vocaboost Logo" className="header-logo" />
                </Link>
            )}

            {/* Search Bar */}
            <div className="header__search-bar">
                <SearchBar 
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                />
            </div>

            {user ? (
                <div className="header__user">

                    {/* Create list action */}
                    <Link to="/" className="homepage_create-list">
                        <img src={Plus} alt="create-list-icon" style={{width: "30px"}}/>
                    </Link>

                    {/* Notification bell */}
                    <div className="homepage__notification">
                        <img src={Bell} alt="notification-icon"  style={{width: "30px"}}/>
                    </div>

                    {/* Avatar Dropdown */}
                    <div className="homepage__topbar">
                        <DropdownMenu />
                    </div>
                </div>
            ) : (
                <div className="header__non-user">
                    <div className="login-signup">
                        <Link to="/signin" className="signin">Sign in</Link>
                        <Link to="/signup" className="signup">Sign up</Link>
                    </div>
                </div>
            )}

        </nav>
    );
}

export default Header