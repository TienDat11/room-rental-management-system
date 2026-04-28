import { z } from "zod";

export const roomCreateSchema = z.object({
  room_number: z.string().min(1, "Vui lòng nhập số phòng").max(20, "Số phòng không được quá 20 ký tự"),
  floor: z.number().int().min(1, "Tầng phải từ 1 trở lên").max(100, "Tầng không được quá 100"),
  area: z.number().positive("Diện tích phải lớn hơn 0").max(999999, "Diện tích không hợp lệ"),
  base_price: z.string().min(1, "Vui lòng nhập giá cơ bản"),
  amenities: z.string().max(1000, "Tiện nghi không được quá 1000 ký tự").optional(),
  description: z.string().max(1000, "Mô tả không được quá 1000 ký tự").optional(),
});

export const roomUpdateSchema = roomCreateSchema.partial();

export type RoomCreateForm = z.infer<typeof roomCreateSchema>;
export type RoomUpdateForm = z.infer<typeof roomUpdateSchema>;