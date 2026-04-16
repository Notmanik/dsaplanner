import axios from "axios";

const API_URL = "https://dsaplanner.onrender.com/api";

const api = axios.create({ 
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});

// 401 Unauthorized interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("planId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
