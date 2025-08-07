import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClassroomTitle,
  TeacherClassroomMenuTab,
  SearchBar,
  ClassroomDropdownMenu,
  LearnersListSkeleton,
} from "../../../components/index";
import classroomService from "../../../services/Classroom/classroomService";
import SeeMoreSection from "../../../components/Classroom/SeeMoreSection";

export default function StudentListPage() {
  // Xử lý lưu trữ dữ liệu learner
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dùng để navigate trang
  const navigate = useNavigate();

  // Xử lý thanh search bar
  const [searchQuery, setSearchQuery] = useState("");

  // Xử lý Learner list hiện theo search bar
  const filterLearners = learners.filter((learners) =>
    learners?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom.
  const [classroomId, setClassroomId] = useState(() => {
    const selectedClassroom = JSON.parse(
      localStorage.getItem("selectedClassroom")
    );
    return selectedClassroom?.id || null;
  });

  useEffect(() => {
    if (!classroomId) {
      console.error("Missing classroom ID");
      return;
    }

    const fetchLearnersList = async () => {
      try {
        setLoading(true);
        const res = await classroomService.getLearnerInClassroom(classroomId);
        if (res.success && Array.isArray(res.data)) {
          setLearners(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLearnersList();
  }, [classroomId]);

  const handleRemove = async (id) => {
    try {
      const res = await classroomService.removeALearner({
        classroomId,
        learnerId: id,
      });
      if (res.success) {
        console.log("Remove thanh cong");
        setLearners(learners.filter((l) => l.learner_id !== id));
      }
    } catch (error) {
      console.error(error.message);
      navigate("/fail");
    }
  };

  if (loading) {
    return <LearnersListSkeleton />;
  }

  return (
    <div className="student-list-page">
      <ClassroomTitle />
      <TeacherClassroomMenuTab />
      <div className="student-list-container">
        {/* Actions */}
        <div className="student-actions">
          <Link to="../add-students" className="btn btn--dark">
            {" "}
            + Add Student
          </Link>

          <div className="pending-request__search-block">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeHolder={"Enter learner email you want to find"}
            />
            <div className="search-block--dropdown-menu">
              <ClassroomDropdownMenu students={learners.length} />
            </div>
          </div>
        </div>

        {learners.length === 0 ? (
          <>
            <div className="empty-list">"No learner available"</div>
          </>
        ) : (
          <>
            <div className="student-list">
              <SeeMoreSection
                items={filterLearners}
                renderItem={(item) => (
                  <div className="student-row" key={item.learner_id}>
                    <span>{item.email}</span>
                    <button
                      className="btn light"
                      onClick={() => handleRemove(item.learner_id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
