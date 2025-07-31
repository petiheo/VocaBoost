import api from "../../lib/api";

const userService = {
  // Get user profile - matches API: GET /api/user/profile
  getProfile: async () => {
    const res = await api.get("/user/profile");
    return res.data;
  },

  // Update user profile - matches API: PUT /api/user/profile (multipart/form-data)
  updateProfile: async (profileData) => {
    const formData = new FormData();

    // Add form fields as per API documentation
    if (profileData.displayName) {
      formData.append("displayName", profileData.displayName);
    }
    if (profileData.dailyGoal) {
      formData.append("dailyGoal", profileData.dailyGoal);
    }
    if (profileData.avatar) {
      formData.append("avatar", profileData.avatar);
    }
    if (profileData.removeAvatar) {
      formData.append("removeAvatar", "true");
    }

    const res = await api.put("/user/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Report content
  reportContent: async (reportData) => {
    const res = await api.post("/user/report", reportData);
    return res.data;
  },
};

export default userService;
