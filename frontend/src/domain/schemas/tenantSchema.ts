import { z } from "zod";

export const tenantCreateSchema = z.object({
  full_name: z
    .string()
    .min(1, "Vui lòng nhập họ và tên")
    .max(100, "Họ tên không được quá 100 ký tự"),
  id_card: z
    .string()
    .min(1, "Vui lòng nhập số CMND/CCCD")
    .regex(
      /^[0-9]{9}$|^[0-9]{12}$/,
      "CMND/CCCD phải gồm 9 hoặc 12 chữ số"
    ),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(
      /^(0[3-9])[0-9]{8}$/,
      "Số điện thoại không đúng định dạng (phải bắt đầu bằng số 0, gồm 10 chữ số)"
    )
    .max(15, "Số điện thoại không được quá 15 ký tự"),
  email: z
    .string()
    .email("Vui lòng nhập đúng định dạng email (ví dụ: email@gmail.com)")
    .max(254, "Email không được quá 254 ký tự")
    .optional()
    .or(z.literal("")),
  date_of_birth: z.string().optional(),
  address: z
    .string()
    .max(255, "Địa chỉ không được quá 255 ký tự")
    .optional(),
  emergency_contact: z
    .string()
    .max(100, "Liên hệ khẩn cấp không được quá 100 ký tự")
    .optional(),
  room: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  notes: z
    .string()
    .max(1000, "Ghi chú không được quá 1.000 ký tự")
    .optional(),
});

export const tenantUpdateSchema = tenantCreateSchema.partial();

export type TenantCreateForm = z.infer<typeof tenantCreateSchema>;
export type TenantUpdateForm = z.infer<typeof tenantUpdateSchema>;
