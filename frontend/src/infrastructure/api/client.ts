import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage");
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
            const { data } = await axios.post("/api/auth/refresh/", {
              refresh: refreshToken,
            });
            const updatedStorage = {
              ...parsed,
              state: { ...parsed.state, accessToken: data.access },
            };
            localStorage.setItem("auth-storage", JSON.stringify(updatedStorage));
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
