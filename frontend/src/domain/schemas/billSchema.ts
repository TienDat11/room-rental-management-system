import { z } from "zod";

const billBaseSchema = z.object({
  contract: z.number().int().positive("Vui lòng chọn hợp đồng"),
  room: z.number().int().positive("Vui lòng chọn phòng"),
  tenant: z.number().int().positive("Vui lòng chọn người thuê"),
  bill_month: z
    .number({ invalid_type_error: "Tháng phải là số" })
    .int("Tháng phải là số nguyên")
    .min(1, "Tháng phải từ 1 đến 12")
    .max(12, "Tháng phải từ 1 đến 12"),
  bill_year: z
    .number({ invalid_type_error: "Năm phải là số" })
    .int("Năm phải là số nguyên")
    .min(2000, "Năm phải từ 2000 trở đi"),
  room_price: z
    .string()
    .min(1, "Vui lòng nhập giá phòng")
    .regex(/^[0-9]+$/, "Giá phòng chỉ được nhập số")
    .refine((val) => Number(val) > 0, {
      message: "Giá phòng phải lớn hơn 0 VNĐ",
    }),
  electricity_previous: z
    .string()
    .regex(/^[0-9]*$/, "Chỉ số điện chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  electricity_current: z
    .string()
    .regex(/^[0-9]*$/, "Chỉ số điện chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  electricity_price_per_unit: z
    .string()
    .regex(/^[0-9]*$/, "Đơn giá điện chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  water_previous: z
    .string()
    .regex(/^[0-9]*$/, "Chỉ số nước chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  water_current: z
    .string()
    .regex(/^[0-9]*$/, "Chỉ số nước chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  water_price_per_unit: z
    .string()
    .regex(/^[0-9]*$/, "Đơn giá nước chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  other_fees: z
    .string()
    .regex(/^[0-9]*$/, "Phí khác chỉ được nhập số")
    .optional()
    .or(z.literal("")),
  other_fees_description: z
    .string()
    .max(255, "Mô tả phí không được quá 255 ký tự")
    .optional(),
  due_date: z.string().min(1, "Vui lòng chọn hạn thanh toán"),
  notes: z
    .string()
    .max(1000, "Ghi chú không được quá 1.000 ký tự")
    .optional(),
});

export const billCreateSchema = billBaseSchema
  .refine(
    (data) => {
      if (!data.electricity_previous || !data.electricity_current) return true;
      return Number(data.electricity_current) >= Number(data.electricity_previous);
    },
    {
      message: "Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ",
      path: ["electricity_current"],
    }
  )
  .refine(
    (data) => {
      if (!data.water_previous || !data.water_current) return true;
      return Number(data.water_current) >= Number(data.water_previous);
    },
    {
      message: "Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ",
      path: ["water_current"],
    }
  );

export const billUpdateSchema = billBaseSchema.partial();

export const paymentCreateSchema = z.object({
  amount: z
    .string()
    .min(1, "Vui lòng nhập số tiền")
    .regex(/^[0-9]+$/, "Số tiền chỉ được nhập số")
    .refine((val) => Number(val) > 0, {
      message: "Số tiền thanh toán phải lớn hơn 0 VNĐ",
    }),
  payment_method: z.enum(["CASH", "TRANSFER"]),
  payment_date: z.string().min(1, "Vui lòng chọn ngày thanh toán"),
  notes: z
    .string()
    .max(1000, "Ghi chú không được quá 1.000 ký tự")
    .optional(),
});

export type BillCreateForm = z.infer<typeof billCreateSchema>;
export type BillUpdateForm = z.infer<typeof billUpdateSchema>;
export type PaymentCreateForm = z.infer<typeof paymentCreateSchema>;
