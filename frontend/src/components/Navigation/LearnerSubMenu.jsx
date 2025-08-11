import { NavLink } from "react-router-dom";
import { useToast } from "../Providers/ToastProvider.jsx";

export default function LearnerSubMenu() {
  const toast = useToast();

  return (
    <div className="learner-submenu">
      <NavLink
        to="/my-classroom"
        className={({ isActive }) => `submenu-tab ${isActive ? "active" : ""}`}
      >
        My Classrooms
      </NavLink>

      <NavLink
        to="/vocabulary"
        className={({ isActive }) => `submenu-tab ${isActive ? "active" : ""}`}
      >
        My Vocabulary Lists
      </NavLink>

      <NavLink
        className={({ isActive }) => `submenu-tab ${isActive ? "" : "active"}`}
        onClick={(e) => {
          e.preventDefault();
          toast("This feature is coming soon!", "success");
        }}
      >
        Statistic
      </NavLink>
    </div>
  );
}
