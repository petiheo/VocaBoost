// src/services/vocabularyService.js
import api from "../../lib/api";

const vocabularyService = {
  // 1. Lấy danh sách của người dùng
  getMyLists: async (params = {}) => {
    const res = await api.get("/vocabulary/my-lists", { params });
    return res.data.data || []; // Trả về mảng rỗng nếu không có dữ liệu
  },

  // 2. Tạo list mới
  createList: async (data) => {
    const res = await api.post(`/vocabulary/lists`, data);
    return res.data || {}; // Trả về đối tượng rỗng nếu không có dữ liệu
  },

  // 3. Tìm kiếm các danh sách công khai
  searchPublicLists: async (params = {}) => {
    const res = await api.get("/vocabulary/search", { params });
    return res.data.data || [];
  },

  // 4. Lấy chi tiết một danh sách
  getListById: async (listId) => {
    const res = await api.get(`/vocabulary/lists/${listId}`); //  sửa endpoint
    return res.data.data.list ||{};
  },

  // 5. Cập nhật danh sách
  updateList: async (listId, data) => {
    const res = await api.put(`/vocabulary/lists/${listId}`, data); //  sửa endpoint
    return res.data.data || [];
  },

  // 6. Xoá danh sách
  deleteList: async (listId) => {
    const res = await api.delete(`/vocabulary/lists/${listId}`); //  sửa endpoint
    return res.data;
  },

  // 7. Lấy các từ trong danh sách
  getWordsByListId: async (listId, params = {}) => {
    const res = await api.get(`/vocabulary/lists/${listId}/words`, { params }); //  sửa endpoint + rename
    return res.data.data.words;
  },

  // 8. Thêm 1 từ
  createWord: async (data) => {
    if (!data.listId || !data.term || !data.definition) return;
    const res = await api.post(`/vocabulary/lists/${data.listId}/words`, data); //  theo API
    return res.data.data.word;
  },

  // 9. Thêm nhiều từ
  createWordsBulk: async (data) => {
    if (!data.listId || !data.words || !Array.isArray(data.words)) return;
    const res = await api.post(`/vocabulary/lists/${data.listId}/words-bulk`, data); //  đúng format bulk
    return res.data.data;
  },

  // 10. Cập nhật từ
  updateWord: async (wordId, data) => {
    if (!wordId) return;
    const res = await api.put(`/vocabulary/words/${wordId}`, data); // sửa endpoint
    return res.data.data.word;
  },

  // 11. Xoá từ
  deleteWord: async (wordId) => {
    if (!wordId) return;
    const res = await api.delete(`/vocabulary/words/${wordId}`); // sửa endpoint
    return res.data;
  },

  // 12. Lấy tất cả tag có sẵn
  getAllTags: async () => {
    const res = await api.get("/vocabulary/tags");
    return res.data.data.tags || [];
  },

  // 13. Upload hình ảnh
  uploadImageForWord: async (formData) => {
    const res = await api.post("/vocabulary/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }
};

export default vocabularyService;
