import { Link } from "react-router-dom";
import MainPageLogo from "../assets/Logo.svg";
import SearchBar from "./SearchBar.jsx";
import DropdownMenu from "./DropdownMenu.jsx";
import { useAuth } from "../services/Auth/authContext.jsx";

const Header = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return (
        <nav className="header">
            {/* Logo */}
            <Link to="/" className="header__site-title">
                <img src={MainPageLogo} alt="Vocaboost Logo" className="header-logo" />
            </Link>
            {/* Search Bar */}
            <div className="header__search-bar">
                <SearchBar/>
            </div>

            {user ? (
                <div className="header__user">

                    {/* Create list action */}
                    {/* <CreateList /> */} 


                    {/* Notification bell */}
                    {/* <Notification /> */} 

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