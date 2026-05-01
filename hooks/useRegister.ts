// hooks/useRegisterForm.ts
import { useState } from "react"
import { useRouter } from "next/navigation"
import { POST_METHOD } from "@/lib/req"
import {RegisterFormData} from "@/types/user";



export function useRegisterForm() {
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [form, setForm] = useState<RegisterFormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<keyof RegisterFormData, string>>
    >({})

    const handleChange = (field: keyof RegisterFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const toggleShowPassword = () => setShowPassword(!showPassword)
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setFieldErrors({})

        if (form.password !== form.confirmPassword) {
            const message = "Mật khẩu xác nhận không đúng!"
            setFieldErrors((prev) => ({ ...prev, confirmPassword: message }))
            setError(message)
            return
        }

        try {
            setLoading(true)
            await POST_METHOD("/api/auth/register", form)

            setSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập ...")

            setTimeout(() => {
                router.push("/login")
            }, 1500)
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: unknown } })?.response?.data as
                | {
                message?: string
                errors?: Partial<Record<keyof RegisterFormData, string[]>>
            }
                | undefined

            const serverErrors = payload?.errors

            if (serverErrors) {
                const nextFieldErrors: Partial<Record<keyof RegisterFormData, string>> = {}
                let firstMessage: string | undefined

                for (const [field, messages] of Object.entries(serverErrors)) {
                    if (messages && messages.length > 0) {
                        const message = messages[0]
                        nextFieldErrors[field as keyof RegisterFormData] = message
                        if (!firstMessage) {
                            firstMessage = message
                        }
                    }
                }

                setFieldErrors(nextFieldErrors)
                setError(firstMessage || payload?.message || "Đăng ký thất bại!")
            } else {
                setError(payload?.message || "Đăng ký thất bại!")
            }
        } finally {
            setLoading(false)
        }
    }

    const isFormValid =
        form.firstName.trim() !== "" &&
        form.lastName.trim() !== "" &&
        form.email.trim() !== "" &&
        form.phone.trim() !== "" &&
        form.password.trim() !== "" &&
        form.confirmPassword.trim() !== ""

    return {
        // State
        form,
        loading,
        error,
        success,
        fieldErrors,
        showPassword,
        showConfirmPassword,
        // Actions
        handleChange,
        handleSubmit,
        toggleShowPassword,
        toggleShowConfirmPassword,
        // Derived
        isFormValid,
    }
}