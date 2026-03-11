import { z } from "zod"

export const registerSchema = z.object({
    firstName: z
        .string()
        .min(1, "Hãy nhập đầy đủ thông tin")
        .max(50),

    lastName: z
        .string()
        .min(1, "Hãy nhập đầy đủ thông tin")
        .max(50),

    email: z
        .string()
        .email("Địa chỉ email không hợp lệ")
        .toLowerCase(),

    phone: z
        .string()
        .min(10, "Số điện thoại quá ngắn")
        .max(11),

    password: z
        .string()
        .min(6, "Mật khẩu phải ít nhất 6 ký tự"),

    confirmPassword: z
        .string()
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu không trùng khớp",
        path: ["confirmPassword"],
    })