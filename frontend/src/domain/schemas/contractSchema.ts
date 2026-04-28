import { z } from "zod";

export const contractCreateSchema = z.object({
  tenant: z.number().int().positive("Vui lòng chọn người thuê"),
  room: z.number().int().positive("Vui lòng chọn phòng"),
  start_date: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  end_date: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  deposit_amount: z.string().max(50, "Tiền cọc không hợp lệ").optional(),
  monthly_rent: z.string().min(1, "Vui lòng nhập tiền thuê hàng tháng").max(50, "Tiền thuê không hợp lệ"),
  terms: z.string().max(2000, "Điều khoản không được quá 2000 ký tự").optional(),
  notes: z.string().max(1000, "Ghi chú không được quá 1000 ký tự").optional(),
});

export const contractUpdateSchema = contractCreateSchema.partial();

export type ContractCreateForm = z.infer<typeof contractCreateSchema>;
export type ContractUpdateForm = z.infer<typeof contractUpdateSchema>;