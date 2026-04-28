import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập").max(50, "Tên đăng nhập không được quá 50 ký tự"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu").max(128, "Mật khẩu không được quá 128 ký tự"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(50, "Tên đăng nhập không được quá 50 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"),
    email: z.string().email("Email không hợp lệ").max(254, "Email không được quá 254 ký tự"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(128, "Mật khẩu không được quá 128 ký tự"),
    password_confirm: z.string().max(128, "Mật khẩu không được quá 128 ký tự"),
    full_name: z.string().min(1, "Vui lòng nhập họ tên").max(100, "Họ tên không được quá 100 ký tự"),
    phone: z.string().max(15, "Số điện thoại không được quá 15 ký tự").optional(),
    role: z.enum(["ADMIN", "LANDLORD", "TENANT"]),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["password_confirm"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;