"use client"

import { useState } from "react"
import {AuthService} from "@/services/auth.service";
export type RegisterFormData = {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
}
export function useRegister() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            setLoading(true)
            setError(null)

            await AuthService.register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                password: form.password,
            })

            window.location.href = "/login"
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        setForm,
        handleSubmit,
        loading,
        error,
    }
}