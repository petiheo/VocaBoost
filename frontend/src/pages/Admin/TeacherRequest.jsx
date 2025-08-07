import { useNavigate } from "react-router-dom";
import adminService from "../../services/Admin/adminService";
import { Header, Footer, AdminSubMenu } from "../../components";
import { useEffect, useState } from "react";

const TeacherRequest = () => {
  const navigate = useNavigate();

  const [teacherRequests, setTeacherRequests] = useState([]);

  const [isReload, setIsReload] = useState(false);

  useEffect(() => {
    const fetchTeacherRequests = async () => {
      try {
        const res = await adminService.getAllPendingTeacherRequest();
        console.log("oke");
        if (res.success && Array.isArray(res.data.requests)) {
          setTeacherRequests(res.data.requests);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách request:", error);
      }
    };
    fetchTeacherRequests();
  }, [isReload]);

  const handleApproveTeacherRequest = async (id) => {
    try {
      const res = await adminService.approveATeacherRequest(id);
      if (res.success) {
        setTeacherRequests(teacherRequests.filter((tr) => tr.requestId !== id));
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
        setTeacherRequests(teacherRequests.filter((tr) => tr.requestId !== id));
        console.log("Reject thanh cong");
      }
    } catch {
      console.error(error.message);
      navigate("/fail");
    }
  };

  return (
    <div className="teacher-request-page">
      <Header />
      <main className="main-content">
        <AdminSubMenu />

        <section className="requests-section">
          <div className="requests-header">
            <h1>Teacher's Request</h1>
            <div className="pending-request__filter-dropdown">
              <span>All lists: {teacherRequests.length}</span>
            </div>
          </div>
          <div className="find-user-bar">
            <input
              type="text"
              placeholder="Enter user's email you want to find"
            />
          </div>

          <table className="requests-table">
            <thead>
              <tr className="request-table__tr">
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {teacherRequests.map((request) => (
                <tr key={request?.requestId}>
                  <td>{request?.requestId}</td>
                  <td>{request?.user?.displayName}</td>
                  <td>{request?.user?.email}</td>
                  <td>
                    <div className="btn">
                      <button
                        className="btn approve"
                        onClick={() =>
                          handleApproveTeacherRequest(request.requestId)
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="btn decline"
                        onClick={() =>
                          handleRejectTeacherRequest(request.requestId)
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      className="review-btn"
                      onClick={() => {
                        localStorage.setItem(
                          "selectedRequest",
                          JSON.stringify(request)
                        );
                        navigate("/admin-teacher-verification");
                        setIsReload(true);
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherRequest;
