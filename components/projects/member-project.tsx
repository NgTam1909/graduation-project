'use client';

import { useEffect, useState } from "react";
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
import { DELETE_METHOD, GET_METHOD, PATCH_METHOD, POST_METHOD } from "@/lib/req";

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
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
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
                    console.error("Kh\u00f4ng t\u00ecm th\u1ea5y th\u00e0nh vi\u00ean:", error);
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
        setRemovingMemberId(null);
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
            setInviteError("Vui l\u00f2ng nh\u1eadp email");
            return;
        }
        setInviteLoading(true);
        setInviteError(null);
        setInviteSuccess(null);
        try {
            await POST_METHOD(`/api/projects/${projectId}/invites`, { email });
            setInviteSuccess("\u0110\u00e3 g\u1eedi l\u1eddi m\u1eddi");
            setInviteEmail("");
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setInviteError(payload?.message ?? "G\u1eedi l\u1eddi m\u1eddi th\u1ea5t b\u1ea1i");
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
                prev.map((member) =>
                    member.id === memberId ? { ...member, role: nextRole } : member
                )
            );
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setRoleError(payload?.message ?? "C\u1eadp nh\u1eadt quy\u1ec1n th\u1ea5t b\u1ea1i");
        } finally {
            setRoleSavingId(null);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!projectId) return;
        const target = members.find((member) => member.id === memberId);
        if (!target || target.isOwner) return;

        const confirmed = window.confirm(
            `X\u00f3a ${target.name || target.email} kh\u1ecfi d\u1ef1 \u00e1n?`
        );
        if (!confirmed) return;

        setRemovingMemberId(memberId);
        setRoleError(null);
        try {
            await DELETE_METHOD(`/api/projects/${projectId}/members`, { memberId });
            setMembers((prev) => prev.filter((member) => member.id !== memberId));
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setRoleError(payload?.message ?? "X\u00f3a th\u00e0nh vi\u00ean th\u1ea5t b\u1ea1i");
        } finally {
            setRemovingMemberId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {projectTitle
                            ? `Th\u00e0nh vi\u00ean - ${projectTitle}`
                            : "Th\u00e0nh vi\u00ean d\u1ef1 \u00e1n"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                    {isPublic ? (
                        <div className="space-y-2 rounded-lg border p-3">
                            <div className="text-sm font-medium">Chia s\u1ebb</div>
                            <div className="flex gap-2">
                                <Input readOnly value={shareLink} />
                                <Button type="button" variant="outline" onClick={handleCopy}>
                                    Sao ch\u00e9p
                                </Button>
                            </div>
                            {copyStatus && (
                                <div className="text-xs text-muted-foreground">{copyStatus}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                M\u1ecdi ng\u01b0\u1eddi c\u00f3 th\u1ec3 tham gia d\u1ef1 \u00e1n qua \u0111\u01b0\u1eddng d\u1eabn
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 rounded-lg border p-3">
                            <div className="text-sm font-medium">L\u1eddi m\u1eddi qua email</div>
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
                                            {inviteLoading ? "\u0110ang g\u1eedi..." : "G\u1eedi"}
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
                                    Ch\u1ec9 c\u00f3 Admin v\u00e0 Leader c\u00f3 th\u1ec3 m\u1eddi th\u00e0nh vi\u00ean
                                </div>
                            )}
                        </div>
                    )}
                    {loading && <p className="text-sm text-muted-foreground">\u0110ang t\u1ea3i...</p>}
                    {!loading && members.length === 0 && (
                        <p className="text-sm text-muted-foreground">Kh\u00f4ng c\u00f3 th\u00e0nh vi\u00ean.</p>
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
                                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                                        {member.isOwner ? "Owner" : member.role}
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={member.role}
                                            onValueChange={(value) =>
                                                handleRoleChange(member.id, value)
                                            }
                                            disabled={
                                                roleSavingId === member.id ||
                                                removingMemberId === member.id
                                            }
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 px-3 text-xs"
                                            onClick={() => handleRemoveMember(member.id)}
                                            disabled={
                                                roleSavingId === member.id ||
                                                removingMemberId === member.id
                                            }
                                        >
                                            {removingMemberId === member.id ? "\u0110ang x\u00f3a..." : "X\u00f3a"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    {(roleSavingId || removingMemberId) && (
                        <div className="text-xs text-muted-foreground">
                            {removingMemberId ? "\u0110ang x\u00f3a..." : "\u0110ang l\u01b0u..."}
                        </div>
                    )}
                    {roleError && <div className="text-xs text-red-500">{roleError}</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
