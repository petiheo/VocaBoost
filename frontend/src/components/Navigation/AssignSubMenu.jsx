import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { name: "Details", route: "/classroom/assignment-detail" },
  { name: "Statistics", route: "/classroom/statistics" },
];

export default function TeacherClassroomMenuTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="sub-menu-tabs">
      <div className="tab-list">
        {tabs.map((tab, idx) => {
          const matchRoutes = Array.isArray(tab.matchRoutes)
            ? tab.matchRoutes
            : [tab.route]; // fallback nếu không có matchRoutes

          const isActive = matchRoutes.some((route) =>
            currentPath.startsWith(route)
          );

          return (
            <div
              key={idx}
              className={`tab ${isActive ? "active" : ""}`}
              onClick={() => navigate(tab.route)}
            >
              {tab.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}