'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
    title?: string
    open: boolean
    onOpenChangeAction: (v: boolean) => void

    profileLoading: boolean
    profileSaving: boolean

    profileName: string
    profileEmail: string

    firstNameValue?: string
    setFirstNameValueAction?: (v: string) => void

    lastNameValue?: string
    setLastNameValueAction?: (v: string) => void

    phoneValue?: string
    setPhoneValueAction?: (v: string) => void

    positionValue: string
    setPositionValueAction: (v: string) => void

    skillsValue: string
    setSkillsValueAction: (v: string) => void

    profileError: string | null
    profileSuccess: string | null

    onSaveAction: () => void | Promise<void>
}

export default function UpdateProfileDialog(props: Props) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChangeAction}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Cập nhật thông tin cá nhân</DialogTitle>
                </DialogHeader>

                {props.profileLoading ? (
                    <div className="text-sm text-muted-foreground">Đang tải...</div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">
                                {props.profileName || "Tài khoản"}
                            </div>
                            {props.profileEmail && (
                                <div className="text-xs text-muted-foreground">
                                    {props.profileEmail}
                                </div>
                            )}
                        </div>

                        {props.setLastNameValueAction && (
                            <div className="space-y-2">
                                <Label>Họ</Label>
                                <Input
                                    value={props.lastNameValue ?? ""}
                                    onChange={(e) => props.setLastNameValueAction?.(e.target.value)}
                                />
                            </div>
                        )}

                        {props.setFirstNameValueAction && (
                            <div className="space-y-2">
                                <Label>Tên</Label>
                                <Input
                                    value={props.firstNameValue ?? ""}
                                    onChange={(e) => props.setFirstNameValueAction?.(e.target.value)}
                                />
                            </div>
                        )}

                        {props.setPhoneValueAction && (
                            <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                <Input
                                    value={props.phoneValue ?? ""}
                                    onChange={(e) => props.setPhoneValueAction?.(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Vị trí</Label>
                            <Input
                                value={props.positionValue}
                                onChange={(e) => props.setPositionValueAction(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Kỹ năng</Label>
                            <Input
                                value={props.skillsValue}
                                onChange={(e) => props.setSkillsValueAction(e.target.value)}
                            />
                        </div>

                        {props.profileError && (
                            <div className="text-xs text-red-500">{props.profileError}</div>
                        )}
                        {props.profileSuccess && (
                            <div className="text-xs text-green-600">{props.profileSuccess}</div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => props.onOpenChangeAction(false)}
                        disabled={props.profileSaving}
                    >
                        Đóng
                    </Button>
                    <Button
                        onClick={props.onSaveAction}
                        disabled={props.profileLoading || props.profileSaving}
                    >
                        {props.profileSaving ? "Đang lưu..." : "Lưu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
