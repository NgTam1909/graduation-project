'use client';

import { useState, useEffect } from "react";
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
import { GET_METHOD, PATCH_METHOD, POST_METHOD } from "@/lib/req";

type ProjectMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    isOwner: boolean;
};

interface MemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string | null;
    projectTitle: string | null;
    isPublic?: boolean | null;
}

const INVITE_ROLES = new Set(["Admin", "Leader"]);
const ROLE_OPTIONS = ["Admin", "Leader", "Member"];

export function MemberDialog({
    open,
    onOpenChange,
    projectId,
    projectTitle,
    isPublic,
}: MemberDialogProps) {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
    const [shareLink, setShareLink] = useState("");
    const [copyStatus, setCopyStatus] = useState<string | null>(null);
    const [roleSavingId, setRoleSavingId] = useState<string | null>(null);
    const [roleError, setRoleError] = useState<string | null>(null);

    useEffect(() => {
        if (open && projectId) {
            const loadMembers = async () => {
                setLoading(true);
                try {
                    const data = (await GET_METHOD(
                        `/api/projects/${projectId}/members`
                    )) as { members?: ProjectMember[]; currentRole?: string | null };
                    setMembers(Array.isArray(data.members) ? data.members : []);
                    setCurrentRole(data.currentRole ?? null);
                } catch (error) {
                    console.error("Không tìm thấy thành viên:", error);
                    setMembers([]);
                    setCurrentRole(null);
                } finally {
                    setLoading(false);
                }
            };

            loadMembers();
        } else {
            setMembers([]);
            setLoading(false);
            setCurrentRole(null);
        }
    }, [open, projectId]);

    useEffect(() => {
        if (projectId && typeof window !== "undefined") {
            setShareLink(`${window.location.origin}/project/${projectId}/join`);
        } else {
            setShareLink("");
        }
        setCopyStatus(null);
        setInviteError(null);
        setInviteSuccess(null);
        setInviteEmail("");
        setRoleError(null);
        setRoleSavingId(null);
    }, [projectId, open]);

    const handleCopy = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopyStatus("Copied");
        } catch {
            setCopyStatus("Copy failed");
        }
        setTimeout(() => setCopyStatus(null), 2000);
    };

    const handleInvite = async () => {
        if (!projectId) return;
        const email = inviteEmail.trim().toLowerCase();
        if (!email) {
            setInviteError("Vui lòng nhập email");
            return;
        }
        setInviteLoading(true);
        setInviteError(null);
        setInviteSuccess(null);
        try {
            await POST_METHOD(`/api/projects/${projectId}/invites`, { email });
            setInviteSuccess("Đã gửi lời mời");
            setInviteEmail("");
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setInviteError(payload?.message ?? "Gửi lời mời thất bại");
        } finally {
            setInviteLoading(false);
        }
    };

    const canInvite = INVITE_ROLES.has(currentRole ?? "");
    const canManageRoles = currentRole === "Admin";

    const handleRoleChange = async (memberId: string, nextRole: string) => {
        if (!projectId) return;
        setRoleSavingId(memberId);
        setRoleError(null);
        try {
            await PATCH_METHOD(`/api/projects/${projectId}/members`, {
                memberId,
                role: nextRole,
            });
            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role: nextRole } : m))
            );
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setRoleError(payload?.message ?? "Cập nhật quyền điều khiển thất bại");
        } finally {
            setRoleSavingId(null);
        }
    };

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
                            <div className="text-sm font-medium">Chia sẻ</div>
                            <div className="flex gap-2">
                                <Input readOnly value={shareLink} />
                                <Button type="button" variant="outline" onClick={handleCopy}>
                                    Sao chép
                                </Button>
                            </div>
                            {copyStatus && (
                                <div className="text-xs text-muted-foreground">{copyStatus}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                Mọi người có thể tham gia dự án qua đường dẫn
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 rounded-lg border p-3">
                            <div className="text-sm font-medium">Lời mời qua email</div>
                            {canInvite ? (
                                <>
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleInvite}
                                            disabled={inviteLoading}
                                        >
                                            {inviteLoading ? "Đang gửi..." : "Gửi"}
                                        </Button>
                                    </div>
                                    {inviteError && (
                                        <div className="text-xs text-red-500">{inviteError}</div>
                                    )}
                                    {inviteSuccess && (
                                        <div className="text-xs text-green-600">{inviteSuccess}</div>
                                    )}
                                </>
                            ) : (
                                <div className="text-xs text-muted-foreground">
                                    Chỉ có Admin và Leader có thể mời thành viên
                                </div>
                            )}
                        </div>
                    )}
                    {loading && (
                        <p className="text-sm text-muted-foreground">Đang tải...</p>
                    )}
                    {!loading && members.length === 0 && (
                        <p className="text-sm text-muted-foreground">Không có thành viên.</p>
                    )}
                    {!loading &&
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <div className="text-sm font-medium">{member.name || member.email}</div>
                                    <div className="text-xs text-muted-foreground">{member.email}</div>
                                </div>
                                {member.isOwner || !canManageRoles ? (
                                    <span className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                                        {member.isOwner ? "Owner" : member.role}
                                    </span>
                                ) : (
                                    <Select
                                        value={member.role}
                                        onValueChange={(value) =>
                                            handleRoleChange(member.id, value)
                                        }
                                        disabled={roleSavingId === member.id}
                                    >
                                        <SelectTrigger className="h-8 w-[140px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLE_OPTIONS.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    {roleSavingId && (
                        <div className="text-xs text-muted-foreground">Đang lưu...</div>
                    )}
                    {roleError && <div className="text-xs text-red-500">{roleError}</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
