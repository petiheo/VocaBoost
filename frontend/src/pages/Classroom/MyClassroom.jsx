import { useState, useEffect } from "react";
import { Header, Footer, SideBar } from "../../components/index";
import { Link, useNavigate, useLocation } from "react-router-dom";
import classroomService from "../../services/Classroom/classroomService";
import { useAuth } from "../../services/Auth/authContext";
import SeeMoreSection from "../../components/Classroom/SeeMoreSection";


const tabs = [
  { name: "Teaching" },
  { name: "Joined" },
];

export default function MyClassroomPage() {
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);


  // Lấy pathname hiện tại, ví dụ: "/my-classroom"
  const [currentTab, setCurrentTab] = useState("Teaching");


  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        let apiCall
        // Trường hợp là giáo viên
        if (user?.role === "teacher") {
          let res;
          switch (currentTab) {
            case "Teaching":
              apiCall = classroomService.myClassroom();
              console.log("Fetching TEACHING classrooms for teacher...");
              break;
            case "Joined":
              apiCall = classroomService.getMyJoined();
              console.log("Fetching JOINED classrooms for teacher...");
              break
            default:
              setClassrooms([]);
              console.log("Error - Do not know currentTab");
              return;
          }

        } else if (user?.role === "learner") { // Trường hợp là học sinh
          apiCall = classroomService.getMyJoined();
          console.log("Fetching JOINED classrooms for learner...");
        }
        if (apiCall) {
          const res = await apiCall;

          if (res.success && Array.isArray(res.data)) {
            setClassrooms(res.data);
          }
          else {
            setClassrooms([]);
          }
        }
        else {
          setClassrooms([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
        setClassrooms([]);
      };
    }
    fetchClassroom();
  }, [currentTab])

  return (
    <div className="my-classroom">
      <Header />
      <div className="my-classroom-container">
        <div className="my-classroom-sidebar">
            <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
        <div className="my-classroom-page">

          <h1>My Classroom</h1>

          {user.role === "teacher" && (
            <div className="sub-menu-tabs">
              <div className="tab-list">
                {tabs.map((tab, idx) => (
                  <div
                    key={idx}
                    className={`tab ${currentTab === tab.name ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab.name)}
                  >
                    {tab.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            <Link to="/join-classroom-page" className="btn light">Join Classroom</Link>
            {user?.role === "teacher" && (
              <Link to="/create-classroom" className="btn dark">+ Create New Classroom</Link>
            )}
            <span className="total">All classrooms: {classrooms.length} </span>
          </div>

          {/* See more */}
          {classrooms.length === 0 ? (
            <>
              <div className="empty-list">"No classrom available"</div>
            </>
          ) : (
            <>
              <div className="classroom-list">
                <SeeMoreSection
                  items={classrooms}
                  renderItem={(item, index) => (
                    <div className="classroom-card" key={item.id}
                      onClick={() => {
                        localStorage.setItem("selectedClassroom", JSON.stringify(item)) // luu thông tin của classroom được chọn
                        // Điều hướng
                        {user?.role === "teacher" ? (
                          navigate(`/classroom/learners-list`)
                        ):(navigate(`/view-classroom`))}
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="info">
                        <span>{item.assignment_count} assignments | {item.learner_count} members</span>
                        <h3>{item.name}</h3>
                      </div>
                    </div>
                  )}
                  initialCount={2}
                  step={3}
                  wrapperClassName="word-list"
                  itemWrapperTag="div"
                />
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>

  );
}

