import { z } from "zod";

export const billCreateSchema = z.object({
  contract: z.number().int().positive("Vui lòng chọn hợp đồng"),
  room: z.number().int().positive("Vui lòng chọn phòng"),
  tenant: z.number().int().positive("Vui lòng chọn người thuê"),
  bill_month: z.number().int().min(1).max(12),
  bill_year: z.number().int().min(2000),
  room_price: z.string().min(1, "Vui lòng nhập giá phòng").max(50, "Giá phòng không hợp lệ"),
  electricity_previous: z.string().max(20, "Chỉ số điện không hợp lệ").optional(),
  electricity_current: z.string().max(20, "Chỉ số điện không hợp lệ").optional(),
  electricity_price_per_unit: z.string().max(20, "Đơn giá điện không hợp lệ").optional(),
  water_previous: z.string().max(20, "Chỉ số nước không hợp lệ").optional(),
  water_current: z.string().max(20, "Chỉ số nước không hợp lệ").optional(),
  water_price_per_unit: z.string().max(20, "Đơn giá nước không hợp lệ").optional(),
  other_fees: z.string().max(50, "Phí khác không hợp lệ").optional(),
  other_fees_description: z.string().max(255, "Mô tả phí không được quá 255 ký tự").optional(),
  due_date: z.string().min(1, "Vui lòng chọn hạn thanh toán"),
  notes: z.string().max(1000, "Ghi chú không được quá 1000 ký tự").optional(),
});

export const billUpdateSchema = billCreateSchema.partial();

export const paymentCreateSchema = z.object({
  amount: z.string().min(1, "Vui lòng nhập số tiền").max(50, "Số tiền không hợp lệ"),
  payment_method: z.enum(["CASH", "TRANSFER"]),
  payment_date: z.string().min(1, "Vui lòng chọn ngày thanh toán"),
  notes: z.string().max(1000, "Ghi chú không được quá 1000 ký tự").optional(),
});

export type BillCreateForm = z.infer<typeof billCreateSchema>;
export type BillUpdateForm = z.infer<typeof billUpdateSchema>;
export type PaymentCreateForm = z.infer<typeof paymentCreateSchema>;