'use client'

import { useEffect, useState } from "react"
import { GET_METHOD, PATCH_METHOD } from "@/lib/req"

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

export function useUpdateProfile(open: boolean) {
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
    const [profileEmail, setProfileEmail] = useState<string>("")
    const [profileName, setProfileName] = useState<string>("")
    const [positionValue, setPositionValue] = useState<string>("")
    const [skillsValue, setSkillsValue] = useState<string>("")

    useEffect(() => {
        if (!open) {
            setProfileError(null)
            setProfileSuccess(null)
            return
        }

        let active = true

        const loadProfile = async () => {
            try {
                setProfileLoading(true)
                setProfileError(null)
                setProfileSuccess(null)

                const user = (await GET_METHOD("/api/auth/me")) as unknown
                if (!active) return

                const firstName =
                    isRecord(user) && typeof user.firstName === "string" ? user.firstName : ""
                const lastName =
                    isRecord(user) && typeof user.lastName === "string" ? user.lastName : ""

                setProfileName(`${lastName} ${firstName}`.trim())
                setProfileEmail(isRecord(user) && typeof user.email === "string" ? user.email : "")

                setPositionValue(
                    isRecord(user) && typeof user.position === "string" ? user.position : ""
                )

                const skills =
                    isRecord(user) && Array.isArray(user.skills)
                        ? (user.skills as unknown[])
                        : []

                setSkillsValue(
                    skills.filter((s: unknown) => typeof s === "string").join(", ")
                )
            } catch {
                if (active) setProfileError("Không thể tải thông tin tài khoản")
            } finally {
                if (active) setProfileLoading(false)
            }
        }

        void loadProfile()

        return () => {
            active = false
        }
    }, [open])

    const handleSaveProfile = async () => {
        try {
            setProfileSaving(true)
            setProfileError(null)
            setProfileSuccess(null)

            const res = (await PATCH_METHOD("/api/auth/me", {
                position: positionValue,
                skills: skillsValue,
            })) as unknown

            if (isRecord(res) && res.success === false) {
                setProfileError(typeof res.message === "string" ? res.message : "Cập nhật thất bại")
                return
            }

            setProfileSuccess("Đã cập nhật thông tin tài khoản")
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data
            setProfileError(payload?.message ?? "Cập nhật thất bại")
        } finally {
            setProfileSaving(false)
        }
    }

    return {
        profileLoading,
        profileSaving,
        profileError,
        profileSuccess,
        profileEmail,
        profileName,
        positionValue,
        setPositionValue,
        skillsValue,
        setSkillsValue,
        handleSaveProfile,
    }
}