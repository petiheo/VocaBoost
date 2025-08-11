import { Link } from "react-router-dom";
import { Bell, Plus } from "../../assets/Auth/index.jsx";
import MainPageLogo from "../../assets/Logo.svg";
import SearchBar from "../Forms/SearchBar.jsx";
import DropdownMenu from "../Navigation/DropdownMenu.jsx";
import { useEmailVerificationRedirect } from "../../hooks/useEmailVerificationRedirect.js";
import { useAuth } from "../../services/Auth/authContext.jsx";

const Header = ({ searchQuery, onSearchChange }) => {
  const { user, loading } = useAuth();

  // Handle email verification redirect for authenticated users
  useEmailVerificationRedirect();

  if (loading) return null;
  return (
    <nav className="header">
      {/* Logo */}
      {user ? (
        <Link to="/homepage" className="header__site-title">
          <img
            src={MainPageLogo}
            alt="Vocaboost Logo"
            className="header-logo"
          />
        </Link>
      ) : (
        <Link to="/" className="header__site-title">
          <img
            src={MainPageLogo}
            alt="Vocaboost Logo"
            className="header-logo"
          />
        </Link>
      )}

      {/* Search Bar */}
      <div className="header__search-bar">
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
      </div>

      {user ? (
        <div className="header__user">
          {/* Create list action */}
          <Link to="/vocabulary" className="homepage_create-list">
            <img src={Plus} alt="create-list-icon" style={{ width: "30px" }} />
          </Link>

          {/* Notification bell */}
          <div className="homepage__notification">
            <img src={Bell} alt="notification-icon" style={{ width: "30px" }} />
          </div>

          {/* Avatar Dropdown */}
          <div className="homepage__topbar">
            <DropdownMenu />
          </div>
        </div>
      ) : (
        <div className="header__non-user">
          <div className="login-signup">
            <Link to="/signin" className="signin">
              Sign in
            </Link>
            <Link to="/signup" className="signup">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
