import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";
import type { PaginatedResponse } from "../../domain/dto/api";
import type { Tenant, TenantCreate, TenantUpdate } from "../../domain/models/Tenant";
import { queryKeys } from "../../infrastructure/api/queryKeys";

export function useTenants() {
  return useQuery({
    queryKey: queryKeys.tenants.list(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Tenant>>("/tenants/").then((res) => res.data),
  });
}

export function useTenant(id: number) {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => apiClient.get<Tenant>(`/tenants/${id}/`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TenantCreate) => apiClient.post("/tenants/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all }),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TenantUpdate }) =>
      apiClient.patch(`/tenants/${id}/`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/tenants/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all }),
  });
}
