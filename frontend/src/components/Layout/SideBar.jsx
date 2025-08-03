import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Logo.svg";
import {Home, Learning, History, Analysis, Setting, LogOut, ArrowRight, ArrowLeft} from "../../assets/icons/index";
import { MyClassroom } from "../../assets/Auth";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* <div className="sidebar__logo">
        <img src={Logo} alt="logo" />
      </div> */}

      <button className="sidebar__toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        <img src={isCollapsed ? ArrowRight : ArrowLeft} alt="toggle" />
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
          <Link to="/homepage" className="sidebar__link">
            <img src={Analysis} alt="analysis icon" />
            <span className="sidebar__label">Statistics & reports</span>
          </Link>
        </div>

        <div className="sidebar__section2">
          <h2 className="sidebar__title">Tools</h2>
          <hr className="sidebar__divider" />
          <Link to="/homepage" className="sidebar__link">
            <img src={Setting} alt="setting icon" />
            <span className="sidebar__label">Setting</span>
          </Link>
          <Link to="/homepage" className="sidebar__link">
            <img src={LogOut} alt="logout icon" />
            <span className="sidebar__label">Log out</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
