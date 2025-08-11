import Logo from "../../components/Layout/Logo";
import { UploadPattern } from "../../assets/icons";
import { useEffect, useState } from "react";
import adminService from "../../services/Admin/adminService";
import { useNavigate } from "react-router-dom";

// Component giờ đây chỉ dùng để hiển thị thông tin
export default function TeacherInformationDisplay() {
  const [requestId, setRequestId] = useState(() => {
    const selectedRequest = JSON.parse(localStorage.getItem("selectedRequest"));
    return selectedRequest?.requestId || null;
  });

  const [teacherInformation, setTeacherInformation] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherInformation = async () => {
      try {
        const res = await adminService.getASpecificTeacherRequest(requestId);
        if (res.success) {
          console.log(res.data);
          setTeacherInformation(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin giáo viên", error);
      }
    };
    fetchTeacherInformation();
  }, [requestId]);

  const handleApproveTeacherRequest = async (id) => {
    try {
      const res = await adminService.approveATeacherRequest(id);
      if (res.success) {
        console.log("Approve thanh cong");
      }
    } catch {
      console.error(error.message);
      navigate("/fail");
    }
  };

  const handleRejectTeacherRequest = async (id) => {
    try {
      const res = await adminService.rejectATeacherRequest(id);
      if (res.success) {
        console.log("Reject thanh cong");
      }
    } catch {
      console.error(error.message);
      navigate("/fail");
    }
  };

  return (
    <div className="teacher-verification">
      <div className="teacher-verification__header">
        <Logo />
      </div>

      <div className="teacher-verification__form-wrapper">
        <h1 className="teacher-verification__title">Teacher Information</h1>

        <div className="teacher-verification__display-content">
          <div className="teacher-verification__grid">
            <div className="teacher-verification__form-left">
              <div className="account-page-display-field">
                <label className="account-page-label">Full name:</label>
                <p className="account-page-value">
                  {teacherInformation.request?.user?.displayName}
                </p>
              </div>

              <div className="account-page-display-field">
                <label className="account-page-label">School:</label>
                <p className="account-page-value">
                  {teacherInformation.request?.institution}
                </p>
              </div>

              <div className="account-page-display-field">
                <label className="account-page-label">School Email</label>
                <p className="account-page-value">
                  {teacherInformation.request?.schoolEmail}
                </p>
              </div>

              <div className="account-page-display-field">
                <label className="account-page-label">Additional notes:</label>
                <p className="account-page-value">
                  {teacherInformation.request?.additionalNotes ||
                    "No additional notes."}
                </p>
              </div>
            </div>

            <div className="teacher-verification__form-right">
              <label className="teacher-verification__upload-label">
                Verification Document:
              </label>

              <div className="teacher-verification__upload-box">
                <div
                  className="teacher-verification__preview"
                  style={{ display: "block" }}
                >
                  <a
                    href={teacherInformation.request?.credentials_url}
                    target="_blank"
                  >
                    <img
                      src={teacherInformation.request?.credentials_url}
                      alt="Preview"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="teacher-verification__buttons">
            <button
              className="btn approve"
              onClick={() => {
                handleApproveTeacherRequest(requestId);
                navigate("/teacher-request");
              }}
            >
              Approve
            </button>
            <button
              className="btn decline"
              onClick={() => {
                handleRejectTeacherRequest(requestId);
                navigate("/teacher-request");
              }}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
