// MemberDialog.tsx
'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useMemberDialog } from "@/hooks/useInviteMember";

interface MemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string | null;
    projectTitle: string | null;
    isPublic?: boolean | null;
}

const ROLE_OPTIONS = ["Admin", "Leader", "Member"];

export function MemberDialog({
                                 open,
                                 onOpenChange,
                                 projectId,
                                 projectTitle,
                                 isPublic,
                             }: MemberDialogProps) {
    const {
        members,
        loading,
        inviteEmail,
        setInviteEmail,
        inviteLoading,
        inviteError,
        inviteSuccess,
        shareLink,
        copyStatus,
        roleSavingId,
        removingMemberId,
        roleError,
        canInvite,
        canManageRoles,
        handleCopy,
        handleInvite,
        handleRoleChange,
        handleRemoveMember,
    } = useMemberDialog({
        open,
        projectId,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {projectTitle
                            ? `Thành viên - ${projectTitle}`
                            : "Thành viên dự án"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {isPublic ? (
                        <div className="space-y-2 rounded-lg border p-3">
                            <div className="text-sm font-medium">
                                Chia sẻ
                            </div>

                            <div className="flex gap-2">
                                <Input readOnly value={shareLink} />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCopy}
                                >
                                    Sao chép
                                </Button>
                            </div>

                            {copyStatus && (
                                <div className="text-xs text-muted-foreground">
                                    {copyStatus}
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                                Mọi người có thể tham gia dự án qua đường dẫn
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 rounded-lg border p-3">
                            <div className="text-sm font-medium">
                                Lời mời qua email
                            </div>

                            {canInvite ? (
                                <>
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={inviteEmail}
                                            onChange={(e) =>
                                                setInviteEmail(e.target.value)
                                            }
                                        />

                                        <Button
                                            type="button"
                                            onClick={handleInvite}
                                            disabled={inviteLoading}
                                        >
                                            {inviteLoading
                                                ? "Đang gửi..."
                                                : "Gửi"}
                                        </Button>
                                    </div>

                                    {inviteError && (
                                        <div className="text-xs text-red-500">
                                            {inviteError}
                                        </div>
                                    )}

                                    {inviteSuccess && (
                                        <div className="text-xs text-green-600">
                                            {inviteSuccess}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-xs text-muted-foreground">
                                    Chỉ có Admin và Leader có thể mời
                                    thành viên
                                </div>
                            )}
                        </div>
                    )}

                    {loading && (
                        <p className="text-sm text-muted-foreground">
                            Đang tải...
                        </p>
                    )}

                    {!loading && members.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Không có thành viên.
                        </p>
                    )}

                    {!loading &&
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <div className="text-sm font-medium">
                                        {member.name || member.email}
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        {member.email}
                                    </div>
                                </div>

                                {member.isOwner ||
                                !canManageRoles ? (
                                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                    {member.isOwner
                        ? "Owner"
                        : member.role}
                  </span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={member.role}
                                            onValueChange={(value) =>
                                                handleRoleChange(
                                                    member.id,
                                                    value
                                                )
                                            }
                                            disabled={
                                                roleSavingId === member.id ||
                                                removingMemberId ===
                                                member.id
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-35 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {ROLE_OPTIONS.map((role) => (
                                                    <SelectItem
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 px-3 text-xs"
                                            onClick={() =>
                                                handleRemoveMember(
                                                    member.id
                                                )
                                            }
                                            disabled={
                                                roleSavingId === member.id ||
                                                removingMemberId ===
                                                member.id
                                            }
                                        >
                                            {removingMemberId ===
                                            member.id
                                                ? "Đang xóa..."
                                                : "Xóa"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}

                    {(roleSavingId ||
                        removingMemberId) && (
                        <div className="text-xs text-muted-foreground">
                            {removingMemberId
                                ? "Đang xóa..."
                                : "Đang lưu..."}
                        </div>
                    )}

                    {roleError && (
                        <div className="text-xs text-red-500">
                            {roleError}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}