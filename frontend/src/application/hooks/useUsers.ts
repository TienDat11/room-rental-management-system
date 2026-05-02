import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";
import type { PaginatedResponse } from "../../domain/dto/api";
import type { User, UserCreateRequest, UserUpdateRequest } from "../../domain/models/User";
import { queryKeys } from "../../infrastructure/api/queryKeys";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<User>>("/auth/").then((res) => res.data),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateRequest) => apiClient.post("/auth/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) =>
      apiClient.patch(`/auth/${id}/`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/auth/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}
