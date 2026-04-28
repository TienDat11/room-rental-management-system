import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";
import type { PaginatedResponse } from "../../domain/dto/api";
import type { Bill, BillCreate, Payment, PaymentCreate } from "../../domain/models/Bill";
import { queryKeys } from "../../infrastructure/api/queryKeys";

export function useBills() {
  return useQuery({
    queryKey: queryKeys.bills.list(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Bill>>("/bills/").then((res) => res.data),
  });
}

export function useBill(id: number) {
  return useQuery({
    queryKey: queryKeys.bills.detail(id),
    queryFn: () => apiClient.get<Bill>(`/bills/${id}/`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BillCreate) => apiClient.post("/bills/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bills.all }),
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BillCreate> }) =>
      apiClient.patch(`/bills/${id}/`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/bills/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bills.all }),
  });
}

export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentCreate }) =>
      apiClient.post<Payment>(`/bills/${id}/pay/`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}
