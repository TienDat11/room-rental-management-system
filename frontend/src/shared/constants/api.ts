export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login/",
    logout: "/auth/logout/",
    me: "/auth/me/",
    refresh: "/auth/refresh/",
    register: "/auth/register/",
  },
} as const;

export function normalizeApiBaseUrl(value?: string) {
  const baseUrl = value?.trim();
  return baseUrl ? baseUrl.replace(/\/+$/, "") : "/api";
}
