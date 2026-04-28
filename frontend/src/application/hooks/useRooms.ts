import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";
import type { PaginatedResponse } from "../../domain/dto/api";
import type { Room, RoomCreate, RoomUpdate, RoomFilters } from "../../domain/models/Room";
import { queryKeys } from "../../infrastructure/api/queryKeys";

export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: queryKeys.rooms.list(filters),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Room>>("/rooms/", { params: filters })
        .then((res) => res.data),
  });
}

export function useRoom(id: number) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(id),
    queryFn: () => apiClient.get<Room>(`/rooms/${id}/`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoomCreate) => apiClient.post("/rooms/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoomUpdate }) =>
      apiClient.patch(`/rooms/${id}/`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/rooms/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all }),
  });
}
