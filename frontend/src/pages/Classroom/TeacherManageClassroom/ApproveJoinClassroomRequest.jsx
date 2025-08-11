import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClassroomDropdownMenu,
  ClassroomTitle,
  TeacherClassroomMenuTab,
} from "../../../components";
import classroomService from "../../../services/Classroom/classroomService";
import SeeMoreSection from "../../../components/Classroom/SeeMoreSection";

export default function ApproveJoinClassroomRequest() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom.
  const [classroomId, setClassroomId] = useState(() => {
    const selectedClassroom = JSON.parse(
      localStorage.getItem("selectedClassroom")
    );
    return selectedClassroom?.id || null;
  });

  const selectedClassroom = JSON.parse(
    localStorage.getItem("selectedClassroom")
  );

  // Fetch data về trang
  useEffect(() => {
    if (!classroomId) {
      console.error("Missing classroom ID");
      return;
    }

    const fetchPendingRequests = async () => {
      try {
        const res = await classroomService.getPendingJoinRequets(classroomId);
        if (res.success && Array.isArray(res.data)) {
          setRequests(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
      }
    };
    fetchPendingRequests();
  }, [classroomId]);

  // Approve request
  const handleApproveJoinRequest = async (id) => {
    try {
      const res = await classroomService.approveJoinRequest({
        classroomId,
        learnerId: id,
      });
      if (res.success) {
        console.log("Approve thanh cong");
        setRequests(requests.filter((r) => r.learner_id !== id));
      }
    } catch (error) {
      console.error(error.message);
      navigate("/fail");
    }
  };
  // Reject request
  const handleRejectJoinRequest = async (id) => {
    try {
      const res = await classroomService.rejectJoinRequest({
        classroomId,
        learnerId: id,
      });
      if (res.success) {
        console.log("Reject thanh cong");
        setRequests(requests.filter((r) => r.learner_id !== id));
      }
    } catch (error) {
      console.error(error.message);
      navigate("/fail");
    }
  };

  // Approve all
  const handleApproveAll = async () => {
    try {
      const res = await classroomService.approveAllJoinRequest({ classroomId });
      if (res.success) {
        console.log(res.message);
        setRequests([]);
      }
    } catch (error) {
      console.log(error.message);
      navigate("/fail");
    }
  };

  // Auto-approve
  const [autoApprove, setAutoApprove] = useState(
    selectedClassroom?.is_auto_approval_enabled
  );

  const toggleAutoApprove = async () => {
    try {
      const newValue = !autoApprove;
      const res = await classroomService.changeAutoApproveSetting(classroomId, {
        isAutoApprovalEnabled: newValue,
      });
      setAutoApprove(res?.data?.isAutoApprovalEnabled ?? false);
      console.log(res.message);
    } catch (error) {
      console.log("Lỗi auto approve", error.message);
    }
  };

  return (
    <div className="approve-join-classroom-request__page">
      <div className="approve-join-classroom-request__class-card">
        <ClassroomTitle />

        <TeacherClassroomMenuTab />

        <div className="pending-request__student-action">
          <Link to="../add-students" className="btn btn--dark">
            {" "}
            + Add Student
          </Link>

          <div className="pending-request__search-block">
            <div className="search-block--btn">
              <button className="btn green" onClick={() => handleApproveAll()}>
                Approve all
              </button>
              <button
                className={`btn ${autoApprove ? "green" : "decline"}`}
                onClick={toggleAutoApprove}
              >
                {autoApprove ? "Auto-Approve Enabled" : "Auto-Approve Disabled"}
              </button>
            </div>
            <div className="search-block--dropdown-menu">
              <ClassroomDropdownMenu students={requests.length} />
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <>
            <div className="empty-list">"No request available"</div>
          </>
        ) : (
          <>
            <div className="student-list">
              <SeeMoreSection
                items={requests}
                renderItem={(item) => (
                  <div className="student-row" key={item.learner_id}>
                    <span>{item.email}</span>
                    <div className="buttons">
                      <button
                        className="btn approve"
                        onClick={() =>
                          handleApproveJoinRequest(item.learner_id)
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="btn decline"
                        onClick={() => handleRejectJoinRequest(item.learner_id)}
                      >
                        Decline
                      </button>
                    </div>
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
