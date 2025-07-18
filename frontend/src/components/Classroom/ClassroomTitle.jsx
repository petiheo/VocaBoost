// export default function ClassroomTitle() {
//     // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
//     const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));// lấy thông tin từ local

//     // Kiểm tra dữ liệu của classroom. 
//     if (!selectedClassroom || !selectedClassroom.id) {
//         return <div className="class-header">No classroom selected</div>;
//     }
//     // Trả về header tương ứng.
//     return (
//         <div className="class-header">
//             <div>
//                 <h2>{selectedClassroom.name}</h2>
//                 <div className="class-tags">
//                     <span className="tag">{selectedClassroom.join_code}</span>
//                     <span className="tag">👥 {selectedClassroom.learnercount}</span>
//                     <span className="tag">{selectedClassroom.classroom_status}</span>
//                 </div>
//             </div>
//         </div>
//     );
// }

import React, { useState, useRef, useEffect } from "react";

export default function ClassroomTitle() {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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

    const handleRemove = () => {
        console.log("Remove clicked");
        // Thêm logic xóa classroom ở đây nếu cần
    };

    if (!selectedClassroom || !selectedClassroom.id) {
        return <div className="class-header">No classroom selected</div>;
    }

    return (
        <div className="class-header">
            <div className="header-left">
                <h2>{selectedClassroom.name}</h2>
                <div className="class-tags">
                    <span className="tag">{selectedClassroom.join_code}</span>
                    <span className="tag">👥 {selectedClassroom.learnercount}</span>
                    <span className="tag">{selectedClassroom.classroom_status}</span>
                </div>
            </div>

            <div className="dropdown-container" ref={dropdownRef}>
                <button 
                    className="dropdown-toggle" 
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    ⋯
                </button>
                {showDropdown && (
                    <div className="dropdown-menu">
                        <button onClick={handleRemove} className="dropdown-item">Remove</button>
                    </div>
                )}
            </div>
        </div>
    );
}
