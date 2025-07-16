import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ClassroomTitle,
    TeacherClassroomMenuTab,
    SearchBar, ClassroomDropdownMenu
} from "../../../components/index";
import classroomService from "../../../services/Classroom/classroomService";

// const initialStudents = Array(7).fill("Jane Smith");

export default function PendingRequestPage() {
    const [request, setRequest] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch data về trang 
    useEffect(() => {
        const fetchPendingRequest = async () => {
            try {
                const res = await classroomService.getPendingJoinRequets();
                if (res.success && Array.isArray(res.data)) {
                    setRequest(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lớp học:", error);
            }
        }
        fetchPendingRequest();
    }, [])
    // Xử lý nút Cancel (chưa hoàn thiện)
    const handleCancel = (learner_id) => {
        setRequest(request.filter((_, i) => i !== learner_id));
    };

    const filteredRequest = request.filter((r) =>
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pending-request__page">
            <ClassroomTitle />

            <TeacherClassroomMenuTab />
            <div className="pending-request__container">
                {/* Actions */}
                <div className="pending-request__student-action">
                    <Link to="../add-students" className="btn btn--dark"> + Add Student</Link>

                    <div className="pending-request__search-block">
                        <SearchBar />
                        <div className="search-block--dropdown-menu">
                            <ClassroomDropdownMenu students={request.length} />
                        </div>
                    </div>
                </div>

                {/* Student list */}
                <div className="pending-request__student-list">
                    {filteredRequest.map((r) => (
                        <div className="pending-request__student-row" key={r.learner_id}>
                            <span>{r.email}</span>
                            <button
                                className="btn btn--light"
                                onClick={() => handleCancel(learner_id)}
                            >
                                Cancel
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pending-request__see-more">
                    <button className="btn btn--see-more">See more ▼</button>
                </div>
            </div>
        </div>
    );
}
