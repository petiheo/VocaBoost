import { data } from "react-router-dom";
import api from "../../lib/api";

const classroomService = {
    //1. Create classroom
    createClassroom: async (data) => {
        const res = await api.post("/classroom/create-classroom", {
            name: data.name,
            description: data.description,
            classroom_status: data.privacy,
            capacity_limit: data.limit
        });
        return res.data;
    },

    //2. My classroom 
    myClassroom: async () => {
        const res = await api.get("/classroom/my-classrooms")
        return res.data
    },

    //3. Request to join classroom 
    joinRequest: async (data) => {
        const res = await api.post("/classroom/join-request", {
            joinCode: data
        })
        return res.data;
    },

    //4. Get Pending Join Requests
    getPendingJoinRequets: async () => {
        // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));// lấy thông tin từ local
        if (!selectedClassroom || !selectedClassroom.id) {
            throw new Error("Missing classroom");
        }
        const classroomId = selectedClassroom.id;
        const res = await api.get(`/classroom/${classroomId}/join-requests`);
        return res.data;
    },

    //5. Approve Join Request
    apporveJoinRequest: async (data) => { // chua cap nhat data ben ApproveClassroomRequest
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom")); // can chuyen qua file ApproveClassroomRequest
        if (!selectedClassroom || !selectedClassroom.id) {
            throw new Error("Missing classroom");
        }
        const classroomId = selectedClassroom.id; 
        const res = await api.post(`/classroom/${classroomId}/approve-request`, {data});
        return res.data
    },

    //6. Reject join request 
    rejectJoinRequest: async (data) => {
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom")); // can chuyen qua file ApproveClassroomRequest
        if (!selectedClassroom || !selectedClassroom.id) {
            throw new Error("Missing classroom");
        }
        const classroomId = selectedClassroom.id; 
        const res = await api.post(`/classroom/${classroomId}/reject-request`, {data});
        return res.data; 
    }
};

export default classroomService;