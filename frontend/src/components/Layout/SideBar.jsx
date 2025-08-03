import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useClickOutside from "../../hooks/useClickOutside";
import {Home, Learning, Analysis, Setting, LogOut, ArrowRight, ArrowLeft} from "../../assets/icons/index";
import { MyClassroom } from "../../assets/Auth"
import { useToast } from "../../components/Providers/ToastProvider.jsx";
import authService from "../../services/Auth/authService";
import { useAuth } from "../../services/Auth/authContext.jsx";
import { useNavigate } from "react-router-dom";

const Sidebar = ({isOpen, setIsOpen}) => {
  const sidebarRef = useRef(null);
  const toast = useToast();
  const { user, logout: contextLogout } = useAuth();
  const navigate = useNavigate();

  useClickOutside(sidebarRef, () => setIsOpen(false), isOpen);

  const handleLogOut = async () => {
      try {
          await authService.logout();
          contextLogout();
          navigate("/");
      } catch (error) {
          console.error("Logout failed:", error);
      }
  }

  return (
    <aside ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>

      <button className="sidebar__toggle" onClick={() => setIsOpen(!isOpen)}>
        <img src={isOpen ? ArrowLeft : ArrowRight} alt="toggle" />
      </button>

      <nav className="sidebar__nav">
        <div className="sidebar__section">
          <h2 className="sidebar__title">General</h2>
          <hr className="sidebar__divider" />
          <Link to="/homepage" className="sidebar__link">
            <img src={Home} alt="home icon" />
            <span className="sidebar__label">Home</span>
          </Link>
          <Link to="/vocabulary" className="sidebar__link">
            <img src={Learning} alt="my vocab icon" />
            <span className="sidebar__label">My Vocabulary Lists</span>
          </Link>
          <Link to="/my-classroom" className="sidebar__link">
            <img src={MyClassroom} alt="my classroom icon" />
            <span className="sidebar__label">My Classrooms</span>
          </Link>
          <Link to="" className="sidebar__link" onClick={() => toast("Feature coming soon!", "success")}>
            <img src={Analysis} alt="analysis icon" />
            <span className="sidebar__label">Learning Statistics</span>
          </Link>
        </div>

        <div className="sidebar__section2">
          <h2 className="sidebar__title">Tools</h2>
          <hr className="sidebar__divider" />
          <Link to="/profile" className="sidebar__link">
            <img src={Setting} alt="setting icon" />
            <span className="sidebar__label">Setting</span>
          </Link>
          <Link to="" className="sidebar__link" onClick={handleLogOut}>
            <img src={LogOut} alt="logout icon" />
            <span className="sidebar__label">Log out</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
