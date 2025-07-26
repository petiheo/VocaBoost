import api from "../../lib/api";

const teacherService = {
  // Submit teacher verification request
  submitVerification: async (formData) => {
    const res = await api.post("/teacher/verification/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Get verification status
  getVerificationStatus: async () => {
    const res = await api.get("/teacher/verification/status");
    return res.data;
  },
};

export default teacherService;