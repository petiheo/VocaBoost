import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { name: "Assignments", route: "/assignment-page" },
  { name: "Statistics", route: "/classroom/statistics" },
  { name: "Learners", route: "/classroom/pending-request" },
];

export default function TeacherClassroomMenuTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="sub-menu-tabs">
      <div className="tab-list">
        {tabs.map((tab, idx) => (
          <div
            key={idx}
            className={`tab ${currentPath === tab.route ? "active" : ""}`}
            onClick={() => navigate(tab.route)}
          >
            {tab.name}
          </div>
        ))}
      </div>
    </div>
  );
}

