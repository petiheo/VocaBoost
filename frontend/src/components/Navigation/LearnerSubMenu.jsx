import { NavLink } from "react-router-dom";

export default function LearnerSubMenu() {
  return (
    <div className="learner-submenu">
      <NavLink
        to="/classroom"
        className={({ isActive }) =>
          `submenu-tab ${isActive ? "active" : ""}`
        }
      >
        My Classrooms
      </NavLink>

      <NavLink
        to="/vocabulary"
        className={({ isActive }) =>
          `submenu-tab ${isActive ? "active" : ""}`
        }
      >
        My Vocabulary Lists
      </NavLink>

      <NavLink
        to="/statistics"
        className={({ isActive }) =>
          `submenu-tab ${isActive ? "active" : ""}`
        }
      >
        Statistic
      </NavLink>
    </div>
  );
}
