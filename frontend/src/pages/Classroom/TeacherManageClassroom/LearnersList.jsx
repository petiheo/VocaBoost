import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClassroomTitle, TeacherClassroomMenuTab, SearchBar, ClassroomDropdownMenu } from "../../../components/index"
import classroomService from "../../../services/Classroom/classroomService";
import SeeMoreSection from "../../../components/Classroom/SeeMoreSection";


export default function StudentListPage() {
    const [learners, setLearners] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
    const [classroomId, setClassroomId] = useState(() => {
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));
        return selectedClassroom?.id || null;
    });

    useEffect(() => {
        if (!classroomId) {
            console.error("Missing classroom ID");
            return;
        }

        const fetchLearnersList = async () => {
            try {
                const res = await classroomService.getLearnerInClassroom(classroomId);
                if (res.success && Array.isArray(res.data)) {
                    setLearners(res.data)
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lớp học:", error);
            }
        }
        fetchLearnersList();
    }, [classroomId]);

    const handleRemove = async (id) => {
        try {
            const res = await classroomService.removeALearner({ classroomId, learnerId: id });
            if (res.success) {
                console.log("Remove thanh cong");
                setLearners(learners.filter((l) => l.learner_id !== id));
            }
        } catch (error) {
            console.error(error.message);
            navigate("/fail");
        }
    };


    return (
        <div className="student-list-page">

            <ClassroomTitle />
            <TeacherClassroomMenuTab />
            <div className="student-list-container">
                {/* Actions */}
                <div className="student-actions">
                    <Link to="../add-students" className="btn btn--dark"> + Add Student</Link>

                    <div className="pending-request__search-block">
                        <SearchBar />
                        <div className="search-block--dropdown-menu">
                            <ClassroomDropdownMenu students={learners.length} />
                        </div>
                    </div>
                </div>

                <div className="student-list">
                    <SeeMoreSection
                        items={learners}
                        renderItem={(item) => (
                            <div className="student-row" key={item.learner_id}>
                                <span>{item.email}</span>
                                <button className="btn light" onClick={() => handleRemove(item.learner_id)}>
                                    Remove
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
