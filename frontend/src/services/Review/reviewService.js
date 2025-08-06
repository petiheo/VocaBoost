import api from "../../lib/api";

const reviewService = {
  // Get lists with due words for review
  getListsWithDueWords: async (params = {}) => {
    const res = await api.get("/review/lists/due", { params });
    return {
      listsWithDueWords: res.data.data?.listsWithDueWords || [],
      pagination: res.data.data?.pagination || {}
    };
  },

  // Get upcoming review lists
  getUpcomingReviewLists: async (params = {}) => {
    const res = await api.get("/review/lists/upcoming", { params });
    return {
      lists: res.data.data?.lists || [],
      pagination: res.data.data?.pagination || {}
    };
  },

  // Get due words for review
  getDueWords: async (params = {}) => {
    const res = await api.get("/review/due", { params });
    return res.data.data || [];
  },

  // Get due words by list ID
  getDueWordsByList: async (listId) => {
    const res = await api.get(`/review/lists/${listId}/due-words`);
    return res.data.data || [];
  },

  // Get active session status
  getActiveSessionStatus: async () => {
    const res = await api.get("/review/sessions/status");
    return res.data.data || null;
  },

  // Get batch summary
  getBatchSummary: async (sessionId) => {
    const res = await api.get(`/review/sessions/${sessionId}/batch-summary`);
    return res.data.data || {};
  },

  // Resume session after batch summary  
  resumeSession: async (sessionId) => {
    const res = await api.post(`/review/sessions/${sessionId}/resume`);
    return res.data.data || {};
  },

  // Start a new review session
  startSession: async (data) => {
    console.log("reviewService.startSession - data:", data);
    console.log("reviewService.startSession - localStorage token exists:", !!localStorage.getItem("token"));
    const res = await api.post("/review/sessions/start", data);
    return res.data.data || {};
  },

  // Submit a review result for a word
  submitResult: async (sessionId, data) => {
    const res = await api.post(`/review/sessions/${sessionId}/submit`, data);
    return res.data.data || {};
  },

  // End a review session
  endSession: async (sessionId, data = {}) => {
    const res = await api.post(`/review/sessions/${sessionId}/end`, data);
    return res.data.data || {};
  },
};

export default reviewService;