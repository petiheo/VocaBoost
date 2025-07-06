import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

//  Thêm token tự động trước mỗi request nếu tồn tại
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // <-- chỗ này!
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;