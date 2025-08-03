import Logo from "../../components/Layout/Logo";
import { UploadPattern } from "../../assets/icons";

// Dữ liệu giả để hiển thị thông tin giáo viên
const dummyTeacherData = {
    fullName: "Nguyễn Thị Bích Thảo",
    institution: "Đại học Khoa học Tự nhiên, ĐHQG-HCM",
    schoolEmail: "ntbthao@hcmus.edu.vn",
    additionalNotes: "Giảng viên khoa Công nghệ thông tin, chuyên ngành Kỹ thuật phần mềm.",
    // Bạn có thể dùng một URL ảnh thật hoặc một ảnh placeholder
    verificationDocumentUrl: "https://via.placeholder.com/400x250.png?text=Teacher+ID+Card+Preview",
};

// Component giờ đây chỉ dùng để hiển thị thông tin
export default function TeacherInformationDisplay() {
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
                                <p className="account-page-value">{dummyTeacherData.fullName}</p>
                            </div>

                            <div className="account-page-display-field">
                                <label className="account-page-label">School:</label>
                                <p className="account-page-value">{dummyTeacherData.institution}</p>
                            </div>

                            <div className="account-page-display-field">
                                <label className="account-page-label">School Email</label>
                                <p className="account-page-value">{dummyTeacherData.schoolEmail}</p>
                            </div>

                            <div className="account-page-display-field">
                                <label className="account-page-label">
                                    Additional notes:
                                </label>
                                <p className="account-page-value">
                                    {dummyTeacherData.additionalNotes || "No additional notes."}
                                </p>
                            </div>
                        </div>

                        <div className="teacher-verification__form-right">
                            <label className="teacher-verification__upload-label">
                                Verification Document:
                            </label>

                            <div className="teacher-verification__upload-box">
                                <div className="teacher-verification__preview" style={{ display: 'block' }}>
                                    {/* <img src={dummyTeacherData.verificationDocumentUrl} alt="Verification Preview" /> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="teacher-verification__buttons">
                        <button className="btn approve"
                            // onClick={() => handleApproveJoinRequest(item.learner_id)}
                        >Approve</button>
                        <button className="btn decline"
                            // onClick={() => handleRejectJoinRequest(item.learner_id)}
                        >Decline</button>
                    </div>
                </div>
            </div>
        </div>
    );
}