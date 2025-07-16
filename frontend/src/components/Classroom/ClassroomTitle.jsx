export default function ClassroomTitle() {
    // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
    const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));// lấy thông tin từ local

    // Kiểm tra dữ liệu của classroom. 
    if (!selectedClassroom || !selectedClassroom.id) {
        return <div className="class-header">No classroom selected</div>;
    }
    // Trả về header tương ứng.
    return (
        <div className="class-header">
            <div>
                <h2>{selectedClassroom.name}</h2>
                <div className="class-tags">
                    <span className="tag">{selectedClassroom.join_code}</span>
                    <span className="tag">👥 {selectedClassroom.learnercount}</span>
                    <span className="tag">{selectedClassroom.classroom_status}</span>
                </div>
            </div>
        </div>
    );
}