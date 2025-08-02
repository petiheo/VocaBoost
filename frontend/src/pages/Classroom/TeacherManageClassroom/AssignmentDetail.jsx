import { useState, useEffect, useRef } from "react";
import { format } from 'date-fns';
import { Line } from "../../../assets/Classroom";
import classroomService from "../../../services/Classroom/classroomService";
import SeeMoreSection from "../../../components/Classroom/SeeMoreSection";
import { useNavigate } from "react-router-dom";

export default function AssignmentDetail() {

  // quan ly trang thai "..."
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
  const [classroomId, setClassroomId] = useState(() => {
    const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));
    return selectedClassroom?.id || null;
  });

  // Truy xuất assignment 
  const [assignment, setAssignment] = useState(() => {
    const selectedAssignment = JSON.parse(localStorage.getItem("selectedAssignment"));
    return selectedAssignment;
  })

  //Khởi tạo biến lưu dữ liệu của Assignment
  const [assignmentsDetail, setAssignmentsDetail] = useState({});

  useEffect(() => {
    if (!classroomId || !assignment?.id) {
      console.error("Missing classroom ID or assignment ID");
      return;
    }

    const fetchingAssignmentDetail = async () => {
      const res = await classroomService.getAssignmentDetails(classroomId, assignment?.id);
      if (res.success) {
        console.log("Fetch assignment detail thành công");
        console.log(res.data);
        setAssignmentsDetail(res.data);
      }
      else {
        console.log(res.message);
      }
    }
    fetchingAssignmentDetail();
  }, [classroomId, assignment?.id]);

  const navigate = useNavigate();

  const handleRemoveAssignment = async () => {
    console.log("Remove clicked");
    // Thêm logic xóa classroom ở đây nếu cần
    try {
      const res = await classroomService.deleteAssignment(classroomId, assignment?.id)
      if (res.success) {
        console.log("Xoá assignment thành công");
        localStorage.removeItem("selectedAssignment");
        setTimeout(() => {
          navigate("/classroom/assignment-page");
        }, 500);
      }
    } catch (err) {
      console.log("Lỗi xoá lớp học ở Assignment", err);
    }
  };


  return (
    <div className="assignment-detail-page">
      <div className="content">
        <div className="assignment-detail__container">
          <h1>Assignment Details</h1>

          <div className="assignment-box">
            <div className="assignment-header">
              <h2>{assignment?.title || "No assignment available"}</h2>
              <div className="dropdown-container" ref={dropdownRef}>
                <button
                  className="dropdown-toggle"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  ⋯
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <button onClick={handleRemoveAssignment} className="dropdown-item">Remove</button>
                  </div>
                )}
              </div>
            </div>
            <div className="assignment-meta">
              <p><strong>Total words:</strong> {assignmentsDetail?.total_words || 0}</p>
              <p><strong>Start date:</strong> {assignmentsDetail?.start_date ? format(new Date(assignment.start_date), 'd/M/yyyy') : 'N/A'}</p>
              <p> <strong>Learner reviewed:</strong> {assignmentsDetail?.reviewed_learner_count || 0}</p>
              <p><strong>Due date:</strong> {assignmentsDetail?.due_date ? format(new Date(assignment.due_date), 'd/M/yyyy') : 'N/A'}</p>
            </div>
          </div>

          <img src={Line} alt="line" className="line" style={{ width: "100%" }} />

          <div className="word-list">
            <SeeMoreSection
              items={assignmentsDetail?.vocabulary}
              renderItem={(item, index) => (
                <div className="word-card" key={index}>
                  <strong>{item?.term}</strong>
                  <p>{item?.definition}</p>
                </div>
              )}
              initialCount={5}
              step={3}
              wrapperClassName="word-list"
              itemWrapperTag="div"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
