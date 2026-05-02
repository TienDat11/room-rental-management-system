import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/shared/constants/api";
import { STORAGE_KEYS } from "@/shared/constants/storage";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem(STORAGE_KEYS.auth);
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Invalid JSON, skip
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const refreshToken = parsed?.state?.refreshToken;
          if (refreshToken) {
            const { data } = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
              refresh: refreshToken,
            });
            const updatedStorage = {
              ...parsed,
              state: { ...parsed.state, accessToken: data.access },
            };
            localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(updatedStorage));
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.auth);
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
