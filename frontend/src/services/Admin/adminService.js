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

    //3. Approve a Teacher Request
    approveATeacherRequest: async (requestId) => {
        const res = await api.put(`/admin/teacher-requests/${requestId}/approve`);
        return res.data; 
    },

    //4. Reject a Teacher Request
    rejectATeacherRequest: async (requestId) => {
        const res = await api.put(`/admin/teacher-requests/${requestId}/reject`);
        return res.data; 
    },

    //5. Get All Open Reports
    getAllOpenReports: async (page = 1, limit = 20) => {
        const res = await api.get(`/admin/reports/open?page=${page}&limit=${limit}`);
        return res.data; 
    },

    //6. Get a Specific Report
    getASpecificReport: async (reportId) => {
        const res = await api.get(`/admin/reports/${reportId}`);
        return res.data; 
    },

    //7. Approve a Report (Delete the reported content)
    approveAReport: async (reportId, notes = "") => {
        const res = await api.put(`/admin/reports/${reportId}/approve`, { notes });
        return res.data; 
    },

    //8. Dismiss a Report (Keep the content)
    dismissAReport: async (reportId, notes = "") => {
        const res = await api.put(`/admin/reports/${reportId}/dismiss`, { notes });
        return res.data; 
    }
};

export default adminService;
