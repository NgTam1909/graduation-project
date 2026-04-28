import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js/max"

const positionSchema = z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}, z.string().max(100, "Chức vụ tối đa 100 ký tự")).optional()

const skillsSchema = z.preprocess((value) => {
    // Accept "a, b, c" from text input or an array of strings.
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
    }

    if (Array.isArray(value)) return value

    return undefined
}, z.array(z.string().trim().min(1).max(50)).max(50)).optional()

const firstNameSchema = z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    return value.trim()
}, z.string().min(1, "Hãy nhập đầy đủ thông tin").max(50)).optional()

const lastNameSchema = z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    return value.trim()
}, z.string().min(1, "Hãy nhập đầy đủ thông tin").max(50)).optional()

const phoneSchema = z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    return value.trim()
}, z
    .string()
    .refine((value) => {
        const phone = parsePhoneNumberFromString(value, "VN")
        const type = phone?.getType()
        return (
            !!phone?.isValid() &&
            (type === "MOBILE" || type === "FIXED_LINE_OR_MOBILE")
        )
    }, "Số điện thoại không hợp lệ")
).optional()

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
        .trim()
        .refine((value) => {
            const phone = parsePhoneNumberFromString(value, "VN")
            const type = phone?.getType()
            return (
                !!phone?.isValid() &&
                (type === "MOBILE" || type === "FIXED_LINE_OR_MOBILE")
            )
        }, "Số điện thoại không hợp lệ"),

    position: positionSchema,
    skills: skillsSchema,

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

export const updateProfileSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    phone: phoneSchema,
    position: positionSchema,
    skills: skillsSchema,
})
