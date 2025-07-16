import { useState, useEffect } from "react";
import { Header, Footer, SideBar } from "../../components/index";
import { Link, useNavigate, useLocation } from "react-router-dom";
import classroomService from "../../services/Classroom/classroomService";
import { useAuth } from "../../services/Auth/authContext";

const tabs = [
  { name: "My classroom", route: "/my-classroom" },
  { name: "My vocabulary list", route: "/my-vocabulary-list" },
  { name: "Statistic", route: "/statistic" },
];

export default function MyClassroomPage() {
  // const [userRole, setUserRole] = useState("teacher"); // 'teacher' | 'learner'
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Lấy pathname hiện tại, ví dụ: "/my-classroom"
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const res = await classroomService.myClassroom();
        if (res.success && Array.isArray(res.data)) {
          setClassrooms(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
      };
    }
    fetchClassroom();
  }, [])

  return (
    <div className="my-classroom">
      <Header />
      <div className="my-classroom-container">
        <div className="my-classroom-sidebar">
          <SideBar />
        </div>
        <div className="my-classroom-page">

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

          {/* Actions */}
          <div className="actions">
            <Link to="/join-classroom-page" className="btn light">Join Classroom</Link>
            {user?.role === "teacher" && (
              <Link to="/create-classroom" className="btn dark">+ Create New Classroom</Link>
            )}
            <span className="total">All classrooms: {classrooms.length} </span>
          </div>

          {/* Classroom List */}
          <div className="classroom-list">
            {classrooms.length === 0 ? (
              <p className="no-classroom-message">No classroom available.</p>
            ) : (classrooms.map((c, index) => (
              <div className="classroom-card"
                key={c.id}
                onClick={() => {
                  localStorage.setItem("selectedClassroom", JSON.stringify(c)) // luu thông tin của classroom được chọn
                  navigate(`/learners/approve-join-classroom-request`); // Điều hướng
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="info">
                  <span>{c.assignment_count} lists | {c.learner_count} members</span>
                  <h3>{c.name}</h3>
                </div>
              </div>
            )))}
          </div>

          {/* See more */}
          <div className="see-more">
            <button className="btn see-more-btn">See more ▼</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>

  );
}

