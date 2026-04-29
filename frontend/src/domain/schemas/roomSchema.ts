import { z } from "zod";

export const roomCreateSchema = z.object({
  room_number: z
    .string()
    .min(1, "Vui lòng nhập số phòng")
    .max(20, "Số phòng không được quá 20 ký tự")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Số phòng chỉ được chứa chữ cái và số (ví dụ: 101, A201)"
    ),
  floor: z
    .number({ invalid_type_error: "Tầng phải là số" })
    .int("Tầng phải là số nguyên")
    .min(1, "Tầng phải từ 1 trở lên")
    .max(100, "Tầng không được quá 100"),
  area: z
    .number({ invalid_type_error: "Diện tích phải là số" })
    .positive("Diện tích phải lớn hơn 0 m²")
    .max(999999, "Diện tích không được quá 999.999 m²"),
  base_price: z
    .string()
    .min(1, "Vui lòng nhập giá cơ bản")
    .regex(/^[0-9]+$/, "Giá cơ bản chỉ được nhập số (ví dụ: 3000000)")
    .refine((val) => Number(val) > 0, {
      message: "Giá cơ bản phải lớn hơn 0 VNĐ",
    }),
  amenities: z
    .string()
    .max(1000, "Tiện nghi không được quá 1.000 ký tự")
    .optional(),
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1.000 ký tự")
    .optional(),
});

export const roomUpdateSchema = roomCreateSchema.partial();

export type RoomCreateForm = z.infer<typeof roomCreateSchema>;
export type RoomUpdateForm = z.infer<typeof roomUpdateSchema>;
