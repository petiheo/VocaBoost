import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import classroomService from "../../../services/Classroom/classroomService";
import SeeMoreSection from "../../../components/Classroom/SeeMoreSection";
import {
  ClassroomTitle,
  TeacherClassroomMenuTab,
  SearchBar,
  ClassroomDropdownMenu,
  PendingRequestSkeleton,
} from "../../../components/index";

export default function PendingRequestPage() {
  // Dùng để lưu thông tin request
  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);

  // Xử lý thanh search bar
  const [searchQuery, setSearchQuery] = useState("");

  // Xử lý request hiện theo search bar
  const filterRequest = request.filter((request) =>
    request?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch data về trang
  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        setLoading(true);
        const res = await classroomService.getPendingJoinRequets();
        if (res.success && Array.isArray(res.data)) {
          setRequest(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingRequest();
  }, []);
  // Xử lý nút Cancel (chưa hoàn thiện)
  const handleCancel = async (id) => {
    setRequest(request.filter((_, i) => i !== learner_id));
  };

  if (loading) {
    return <PendingRequestSkeleton />;
  }

  return (
    <div className="pending-request__page">
      <ClassroomTitle />

      <TeacherClassroomMenuTab />
      <div className="pending-request__container">
        {/* Actions */}
        <div className="pending-request__student-action">
          <Link to="../add-students" className="btn btn--dark">
            {" "}
            + Add Student
          </Link>

          <div className="pending-request__search-block">
            <SearchBar
              value={searchQuery}
              onChange={searchQuery}
              placeHolder={"Enter learner email you want to find"}
            />
            <div className="search-block--dropdown-menu">
              <ClassroomDropdownMenu students={request.length} />
            </div>
          </div>
        </div>

        {/* Student list */}

        <div className="pending-request__student-list">
          <SeeMoreSection
            items={request}
            renderItem={(item) => (
              <div
                className="pending-request__student-row"
                key={item.learner_id}
              >
                <span>{item.email}</span>
                <button
                  className="btn btn--light"
                  onClick={() => handleCancel(item.learner_id)}
                >
                  Cancel
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
