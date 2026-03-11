"use client"

import LoginForm from "@/components/account/login"
import { useLogin } from "@/hooks/useLogin"

export default function LoginPage() {
    const login = useLogin()

    return <LoginForm {...login} />
}