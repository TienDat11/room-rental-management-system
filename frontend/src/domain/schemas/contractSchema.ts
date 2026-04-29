import { z } from "zod";

const contractBaseSchema = z.object({
  tenant: z.number().int().positive("Vui lòng chọn người thuê"),
  room: z.number().int().positive("Vui lòng chọn phòng"),
  start_date: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  end_date: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  deposit_amount: z
    .string()
    .regex(/^[0-9]*$/, "Tiền cọc chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  monthly_rent: z
    .string()
    .min(1, "Vui lòng nhập tiền thuê hàng tháng")
    .regex(/^[0-9]+$/, "Tiền thuê chỉ được nhập số (ví dụ: 3000000)")
    .refine((val) => Number(val) > 0, {
      message: "Tiền thuê phải lớn hơn 0 VNĐ",
    }),
  terms: z
    .string()
    .max(2000, "Điều khoản không được quá 2.000 ký tự")
    .optional(),
  notes: z
    .string()
    .max(1000, "Ghi chú không được quá 1.000 ký tự")
    .optional(),
});

export const contractCreateSchema = contractBaseSchema.refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    return new Date(data.end_date) > new Date(data.start_date);
  },
  {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["end_date"],
  }
);

export const contractUpdateSchema = contractBaseSchema.partial();

export type ContractCreateForm = z.infer<typeof contractCreateSchema>;
export type ContractUpdateForm = z.infer<typeof contractUpdateSchema>;
