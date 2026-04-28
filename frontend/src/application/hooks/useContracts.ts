import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";
import type { PaginatedResponse } from "../../domain/dto/api";
import type { Contract, ContractCreate, ContractUpdate } from "../../domain/models/Contract";
import { queryKeys } from "../../infrastructure/api/queryKeys";

export function useContracts() {
  return useQuery({
    queryKey: queryKeys.contracts.list(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Contract>>("/contracts/").then((res) => res.data),
  });
}

export function useContract(id: number) {
  return useQuery({
    queryKey: queryKeys.contracts.detail(id),
    queryFn: () => apiClient.get<Contract>(`/contracts/${id}/`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContractCreate) => apiClient.post("/contracts/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all }),
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContractUpdate }) =>
      apiClient.patch(`/contracts/${id}/`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/contracts/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all }),
  });
}
