import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .max(50, "Tên đăng nhập không được quá 50 ký tự"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(128, "Mật khẩu không được quá 128 ký tự"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(50, "Tên đăng nhập không được quá 50 ký tự")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
      ),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Vui lòng nhập đúng định dạng email (ví dụ: email@gmail.com)")
      .max(254, "Email không được quá 254 ký tự"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(128, "Mật khẩu không được quá 128 ký tự")
      .regex(
        /[A-Z]/,
        "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa"
      )
      .regex(
        /[0-9]/,
        "Mật khẩu phải chứa ít nhất 1 chữ số"
      ),
    password_confirm: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu")
      .max(128, "Mật khẩu không được quá 128 ký tự"),
    full_name: z
      .string()
      .min(1, "Vui lòng nhập họ và tên")
      .max(100, "Họ tên không được quá 100 ký tự"),
    phone: z
      .string()
      .regex(
        /^(0[3-9])[0-9]{8}$/,
        "Số điện thoại không đúng định dạng (phải bắt đầu bằng số 0, gồm 10 chữ số)"
      )
      .optional()
      .or(z.literal("")),
    role: z.enum(["LANDLORD", "TENANT"]),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Mật khẩu xác nhận không khớp với mật khẩu đã nhập",
    path: ["password_confirm"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
