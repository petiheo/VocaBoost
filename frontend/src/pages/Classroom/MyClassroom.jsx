import { useState } from "react";
import { Header, Footer, SideBar } from "../../components/index"
import { Link } from "react-router-dom";

const classrooms = Array(5).fill({
  name: "Family and Friend Class",
  lists: 3,
  members: 5,
});


const tabs = [
  { name: "My classroom", active: false },
  { name: "My vocabulary list", active: false },
  { name: "Statistic", active: true },
];

export default function MyClassroomPage() {
  const [userRole, setUserRole] = useState("teacher"); // 'teacher' | 'learner'

  return (
    <div className="my-classroom">
      <Header />
      <div className="my-classroom-container">
        <div className="my-classroom-sidebar">
          <SideBar />
        </div>
        <div className="my-classroom-page">
          {/* Header + Role Switch (for demo purpose) */}
          {/* <div className="my-classroom-header">
            <h2>My Classrooms - {userRole === "teacher" ? "Teacher" : "Learner"}</h2>
            <div className="role-switch">
              <button
                className={userRole === "teacher" ? "active" : ""}
                onClick={() => setUserRole("teacher")}
              >
                Teacher View
              </button>
              <button
                className={userRole === "learner" ? "active" : ""}
                onClick={() => setUserRole("learner")}
              >
                Learner View
              </button>
            </div>
          </div> */}

          <div className="sub-menu-tabs">
            <div className="tab-list">
              {tabs.map((tab, idx) => (
                <div
                  key={idx}
                  className={`tab ${tab.active ? "active" : ""}`}
                >
                  {tab.name}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button className="btn light">Join Classroom</button>
            {userRole === "teacher" && (
              <button className="btn dark">+ Create New Classroom</button>
            )}
            <span className="total">All classrooms: 32</span>
          </div>

          {/* Classroom List */}
          <div className="classroom-list">
            {classrooms.map((c, index) => (
              <div className="classroom-card" key={index}>
                <div className="info">
                  <span>{c.lists} lists | {c.members} members</span>
                  <h3>{c.name}</h3>
                </div>
              </div>
            ))}
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
