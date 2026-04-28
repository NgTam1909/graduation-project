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
import {IUser} from "@/types/user";

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
        <div className="container mx-auto max-w-5xl p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{getFullName()}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </CardDescription>
                                {user.isGod && (
                                    <Badge variant="destructive" className="mt-2">
                                        Super Admin
                                    </Badge>
                                )}
                            </div>
                        </div>
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
                            >
                                <User className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
                            <TabsTrigger value="skills">Vị trí và kỹ năng</TabsTrigger>
                            <TabsTrigger value="address">Địa chỉ</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Họ</Label>
                                    <div className="text-sm">{user.lastName}</div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Tên</Label>
                                    <div className="text-sm">{user.firstName}</div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {user.phone}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="position">Vị trí</Label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {user.position || "Chưa cập nhật"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Kỹ năng</Label>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.length > 0 ? (
                                        user.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            Chưa có kỹ năng
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="address" className="space-y-4 pt-4">
                            {user.address && user.address.length > 0 ? (
                                user.address.map((addr) => (
                                    <Card key={addr._id}>
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-sm">{addr.street}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {addr.city}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có địa chỉ</p>
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
