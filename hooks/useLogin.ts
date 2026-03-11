"use client"

import { useState } from "react"
import { AuthService } from "@/services/auth.service"

export function useLogin() {
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await AuthService.login({
                email: identifier,
                password,
            })

            localStorage.setItem("token", data.token)
            window.location.href = "/dashboard"
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        identifier,
        password,
        setIdentifier,
        setPassword,
        handleSubmit,
        loading,
        error,
    }
}