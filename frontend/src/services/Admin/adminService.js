import api from "../../lib/api";

const adminService = {

    //1. Get All Pending Teacher Requests
    getAllPendingTeacherRequest: async () => {
        const res = await api.get("/admin/teacher-requests/pending");
        return res.data; 
    },

    //2. Get a Specific Teacher Request
    getASpecificTeacherRequest: async (requestId) => {
        const res = await api.get(`/admin/teacher-requests/${requestId}`);
        return res.data; 
    },

    //3. Approve a Teacher Request
    approveATeacherRequest: async (requestId) => {
        const res = await api.put(`/admin/teacher-requests/${requestId}/approve`);
        return res.data; 
    },

    //4. Reject a Teacher Request
    rejectATeacherRequest: async (requestId) => {
        const res = await api.put(`/admin/teacher-requests/${requestId}/reject`);
        return res.data; 
    }
};

export default adminService;