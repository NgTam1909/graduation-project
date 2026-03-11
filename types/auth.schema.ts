import { z } from "zod";

export const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(2, "Họ phải có ít nhất 2 ký tự")
            .max(50),

        lastName: z
            .string()
            .min(2, "Tên phải có ít nhất 2 ký tự")
            .max(50),

        email: z
            .string()
            .email("Email không hợp lệ"),

        phone: z
            .string()
            .regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),

        password: z
            .string()
            .min(8, "Mật khẩu tối thiểu 8 ký tự")
            .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
            .regex(/[a-z]/, "Cần ít nhất 1 chữ thường")
            .regex(/[0-9]/, "Cần ít nhất 1 số"),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;