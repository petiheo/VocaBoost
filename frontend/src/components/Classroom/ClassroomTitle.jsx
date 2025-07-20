import { useState, useRef, useEffect } from "react";
import { ClassroomTitlePattern, JoinCodeIcon } from "../../assets/Classroom/index";
import { useAuth } from "../../services/Auth/authContext"
import classroomService from "../../services/Classroom/classroomService";
import { useNavigate } from "react-router-dom";

export default function ClassroomTitle() {
    const navigate = useNavigate();
    const { user, loading } = useAuth(); // load du lieu cua tai khoan

    // quan ly trang thai "..."
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // load du lieu cua lop hoc duoc chon 
    const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));

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

    // Xu ly ham copy 
    const [copied, setCopied] = useState(false)
    const handleCopy = async (join_code) => {
        try {
            await navigator.clipboard.writeText(join_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.log("Không thể sao chép", err);
        }
    }

    const handleRemoveClassroom = async () => {
        console.log("Remove clicked");
        // Thêm logic xóa classroom ở đây nếu cần
        try {
            const res = await classroomService.deleteAClassroom(selectedClassroom.id);
            if (res.success) {
                console.log("Xoá lớp học thành công")
                navigate("/my-classroom");
            }
        } catch (err) {
            console.log("Lỗi xoá lớp học ở ClassroomTitle", err);
        }
    };

    if (!selectedClassroom || !selectedClassroom.id) {
        return <div className="class-header">No classroom selected</div>;
    }
    // bổ sung cho từng role leaner | teacher
    return (
        <div className="class-header">
            {/* {user?.role === "teacher" ? ( */}
            <div className="dropdown-container" ref={dropdownRef}>
                <button
                    className="dropdown-toggle"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    ⋯
                </button>
                {showDropdown && (
                    <div className="dropdown-menu">
                        <button onClick={handleRemoveClassroom} className="dropdown-item">Remove</button>
                    </div>
                )}
            </div>
            {/* ):(
                <></>
            )} */}


            <div className="header-left">
                <h2>{selectedClassroom.name}</h2>
                <div className="class-tags">
                    <span className="tag"
                        onClick={() => handleCopy(selectedClassroom.join_code)}>
                        {copied ? "Copied" : selectedClassroom.join_code}
                        <img src={JoinCodeIcon} alt="join-code-icon" width="13px" />
                    </span>
                    <span className="tag"><img src={ClassroomTitlePattern} alt="classroom-memebers" width="13px" /> {selectedClassroom.learner_count}</span>
                    <span className="tag">{selectedClassroom.classroom_status}</span>
                </div>
            </div>

        </div>
    );
}
