'use client'

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UpdateProfileDialog from "@/components/account/updateProfile"
import { Briefcase, Mail, MapPin, Phone, User } from "lucide-react"
import { IUser } from "@/types/user"

interface UserProfileProps {
    user: IUser
    isEditable?: boolean
    onSave?: (data: Partial<IUser>) => Promise<void>
}

export default function UserProfile({ user, isEditable = false, onSave }: UserProfileProps) {
    const [editOpen, setEditOpen] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

    const initialFormData = useMemo(
        () => ({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            position: user.position || "",
            skills: user.skills.join(", "),
        }),
        [user.firstName, user.lastName, user.phone, user.position, user.skills]
    )
    const [formData, setFormData] = useState(initialFormData)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!editOpen) {
            setFormData(initialFormData)
            setProfileError(null)
            setProfileSuccess(null)
        }
    }, [editOpen, initialFormData])

    const getInitials = () => {
        return `${user.lastName.charAt(0)}${user.firstName.charAt(0)}`.toUpperCase()
    }

    const getFullName = () => {
        return `${user.lastName} ${user.firstName}`
    }

    const handleSave = async () => {
        if (!onSave) return

        setIsLoading(true)
        setProfileError(null)
        setProfileSuccess(null)
        try {
            await onSave({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                position: formData.position,
                skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
            })
            setEditOpen(false)
        } catch (error) {
            console.error("Failed to save profile:", error)
            setProfileError("Lưu thất bại. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData(initialFormData)
        setProfileError(null)
        setProfileSuccess(null)
    }

    return (
        <div className="container mx-auto max-w-5xl p-3 sm:p-6">
            <Card className="overflow-hidden">
                {/* ✅ Header responsive stack */}
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Avatar + info - responsive */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                            {/* Avatar responsive size */}
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                                <AvatarFallback className="text-lg sm:text-2xl bg-primary text-primary-foreground">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <CardTitle className="text-xl sm:text-2xl break-words">
                                    {getFullName()}
                                </CardTitle>
                                <CardDescription className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1 text-xs sm:text-sm">
                                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="break-all">{user.email}</span>
                                </CardDescription>
                                {user.isGod && (
                                    <Badge variant="destructive" className="mt-1 sm:mt-2 text-xs">
                                        Super Admin
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Edit button */}
                        {isEditable && (
                            <Button
                                onClick={() => {
                                    setFormData(initialFormData)
                                    setEditOpen(true)
                                    setProfileError(null)
                                    setProfileSuccess(null)
                                }}
                                variant="outline"
                                disabled={!onSave}
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Chỉnh sửa
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                    {/* ✅ Tabs responsive - tránh bị dồn */}
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-4 sm:mb-6">
                            <TabsTrigger value={"info"} className="text-xs sm:text-sm py-1.5 sm:py-2">
                                Thông tin cá nhân
                            </TabsTrigger>
                            <TabsTrigger value={"skills"} className="text-xs sm:text-sm py-1.5 sm:py-2">
                                Vị trí và kỹ năng
                            </TabsTrigger>
                            <TabsTrigger value="address" className="text-xs sm:text-sm py-1.5 sm:py-2">
                                Địa chỉ
                            </TabsTrigger>
                        </TabsList>

                        {/* ✅ Info tab - 1 cột trên mobile, 2 cột trên tablet/desktop */}
                        <TabsContent value="info" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-1 sm:space-y-2">
                                    <Label className="text-xs sm:text-sm">Họ</Label>
                                    <div className="text-sm sm:text-base break-words">{user.lastName}</div>
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <Label className="text-xs sm:text-sm">Tên</Label>
                                    <div className="text-sm sm:text-base break-words">{user.firstName}</div>
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <Label className="text-xs sm:text-sm">Số điện thoại</Label>
                                    <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="break-all">{user.phone}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <Label className="text-xs sm:text-sm">Email</Label>
                                    <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="break-all">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* ✅ Skills tab */}
                        <TabsContent value="skills" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                            <div className="space-y-1 sm:space-y-2">
                                <Label className="text-xs sm:text-sm">Vị trí</Label>
                                <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                    <span>{user.position || "Chưa cập nhật"}</span>
                                </div>
                            </div>

                            <div className="space-y-1 sm:space-y-2">
                                <Label className="text-xs sm:text-sm">Kỹ năng</Label>
                                {/* ✅ Skills badge wrap tốt, không tràn */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full">
                                    {user.skills.length > 0 ? (
                                        user.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs sm:text-sm text-muted-foreground">
                                            Chưa có kỹ năng
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* ✅ Address tab - responsive layout */}
                        <TabsContent value="address" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                            {user.address && user.address.length > 0 ? (
                                user.address.map((addr) => (
                                    <Card key={addr._id} className="overflow-hidden">
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                <div className="flex items-start gap-2 min-w-0">
                                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm sm:text-base break-words">{addr.street}</p>
                                                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                                            {addr.city}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                    <MapPin className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm sm:text-base">Chưa có địa chỉ</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <UpdateProfileDialog
                title="Quản lý trang cá nhân"
                open={editOpen}
                onOpenChangeAction={(open) => {
                    setEditOpen(open)
                    if (!open) handleCancel()
                }}
                profileLoading={false}
                profileSaving={isLoading}
                profileName={getFullName()}
                profileEmail={user.email}
                firstNameValue={formData.firstName}
                setFirstNameValueAction={(v) => setFormData({ ...formData, firstName: v })}
                lastNameValue={formData.lastName}
                setLastNameValueAction={(v) => setFormData({ ...formData, lastName: v })}
                phoneValue={formData.phone}
                setPhoneValueAction={(v) => setFormData({ ...formData, phone: v })}
                positionValue={formData.position}
                setPositionValueAction={(v) => setFormData({ ...formData, position: v })}
                skillsValue={formData.skills}
                setSkillsValueAction={(v) => setFormData({ ...formData, skills: v })}
                profileError={profileError}
                profileSuccess={profileSuccess}
                onSaveAction={handleSave}
            />
        </div>
    )
}