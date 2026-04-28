import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";
import type { User, LoginRequest, LoginResponse, RegisterRequest } from "../../domain/models/User";
import { useAuthStore } from "../stores/authStore";
import { queryKeys } from "../../infrastructure/api/queryKeys";

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => apiClient.get<User>("/auth/me/").then((res) => res.data),
    enabled: isAuthenticated,
  });
}

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await apiClient.post<LoginResponse>("/auth/login/", data);
      return res.data;
    },
    onSuccess: async (tokens) => {
      setTokens(tokens.access, tokens.refresh);
      const { data } = await apiClient.get<User>("/auth/me/");
      setUser(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.post("/auth/register/", data),
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await apiClient.post("/auth/logout/", { refresh: refreshToken }).catch(() => {});
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}