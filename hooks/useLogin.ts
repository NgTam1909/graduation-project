"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { AuthService } from "@/services/auth.service"

export function useLogin() {
    const searchParams = useSearchParams()
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
            const redirect = searchParams?.get("redirect")
            if (redirect && redirect.startsWith("/")) {
                window.location.href = redirect
            } else {
                window.location.href = "/dashboard"
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed"
            setError(message)
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
