import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClassroomTitle,
  TeacherClassroomMenuTab,
} from "../../../components/index";
import classroomService from "../../../services/Classroom/classroomService";

export default function AddStudentPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Xử lý trạng thái của email
  const [invitations, setInvitations] = useState([]); // lưu danh sách lời mời

  // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom.
  const [classroomId, setClassroomId] = useState(() => {
    const selectedClassroom = JSON.parse(
      localStorage.getItem("selectedClassroom")
    );
    return selectedClassroom?.id || null;
  });

  // Fetch data về trang
  const fetchDataInvitations = async () => {
    if (!classroomId) {
      console.error("Missing classroom ID");
      return;
    }
    try {
      const res = await classroomService.getInvitations(classroomId);
      if (res.success && Array.isArray(res.data)) {
        setInvitations(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lời mời:", error.message);
      navigate("/fail");
    }
  };

  useEffect(() => {
    fetchDataInvitations();
  }, [classroomId]);

  // Xử lý việc gửi lời mời đến cho learners
  const handleInviteLearner = async (invited_email) => {
    try {
      const res = await classroomService.inviteLearner({
        classroomId,
        email: invited_email,
      });
      if (res.success) {
        console.log("Gửi lời mời thành công");
        setEmail("");
        fetchDataInvitations();
      }
    } catch (error) {
      console.log("Lỗi trong việc gửi lời mời learner", error.message);
      navigate("/fail");
    }
  };

  // Xử lý việc cancel lời mời gửi đến learner
  const handleCancel = async (canceled_email) => {
    console.log(canceled_email);
    try {
      const res = await classroomService.cancelInvitation(
        classroomId,
        canceled_email
      );
      if (res.success) {
        console.log(res.message);
        setInvitations(invitations.filter((i) => i.email !== canceled_email));
      }
    } catch (error) {
      console.log("Lỗi cancel lời mời:", error.message);
      navigate("/fail");
    }
  };

  return (
    <div className="add-student-page">
      <div className="add-student-page__container">
        <ClassroomTitle />
        <TeacherClassroomMenuTab />

        <h2 className="page-title">Add learner</h2>

        {/* Add student form */}
        <div className="form-section">
          <label>Student</label>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter student's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={() => handleInviteLearner(email)}>Add</button>
          </div>
        </div>

        {/* Student list */}
        <div className="student-list">
          <h4>Student list</h4>
          {invitations.map((i) => (
            <div className="student-row" key={i.email}>
              <span>{i.email}</span>
              <button onClick={() => handleCancel(i.email)}>Cancel</button>
            </div>
          ))}
        </div>

        {/* See more */}
        <div className="see-more">
          <button>See more ▼</button>
        </div>
      </div>
    </div>
  );
}
