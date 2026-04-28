import { z } from "zod";

export const tenantCreateSchema = z.object({
  full_name: z.string().min(1, "Vui lòng nhập họ tên").max(100, "Họ tên không được quá 100 ký tự"),
  id_card: z.string().min(1, "Vui lòng nhập CMND/CCCD").max(20, "CMND/CCCD không được quá 20 ký tự"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại").max(15, "Số điện thoại không được quá 15 ký tự"),
  email: z.string().email("Email không hợp lệ").max(254, "Email không được quá 254 ký tự").optional().or(z.literal("")),
  date_of_birth: z.string().optional(),
  address: z.string().max(255, "Địa chỉ không được quá 255 ký tự").optional(),
  emergency_contact: z.string().max(100, "Liên hệ khẩn cấp không được quá 100 ký tự").optional(),
  room: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  notes: z.string().max(1000, "Ghi chú không được quá 1000 ký tự").optional(),
});

export const tenantUpdateSchema = tenantCreateSchema.partial();

export type TenantCreateForm = z.infer<typeof tenantCreateSchema>;
export type TenantUpdateForm = z.infer<typeof tenantUpdateSchema>;