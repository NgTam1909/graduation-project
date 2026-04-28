// use-member-dialog.ts
'use client';

import { useEffect, useState } from "react";
import {
    DELETE_METHOD,
    GET_METHOD,
    PATCH_METHOD,
    POST_METHOD,
} from "@/lib/req";
import { ProjectMember } from "@/types/project";

const INVITE_ROLES = new Set(["Admin", "Leader"]);

interface UseMemberDialogProps {
    open: boolean;
    projectId: string | null;
}

export function useMemberDialog({
                                    open,
                                    projectId,
                                }: UseMemberDialogProps) {
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
            const payload = (err as {
                response?: { data?: { message?: string } };
            })?.response?.data;

            setInviteError(payload?.message ?? "Gửi lời mời thất bại");
        } finally {
            setInviteLoading(false);
        }
    };

    const canInvite = INVITE_ROLES.has(currentRole ?? "");
    const canManageRoles = currentRole === "Admin";

    const handleRoleChange = async (
        memberId: string,
        nextRole: string
    ) => {
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
                    member.id === memberId
                        ? { ...member, role: nextRole }
                        : member
                )
            );
        } catch (err: unknown) {
            const payload = (err as {
                response?: { data?: { message?: string } };
            })?.response?.data;

            setRoleError(
                payload?.message ?? "Cập nhật quyền thất bại"
            );
        } finally {
            setRoleSavingId(null);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!projectId) return;

        const target = members.find(
            (member) => member.id === memberId
        );

        if (!target || target.isOwner) return;

        const confirmed = window.confirm(
            `Xóa ${target.name || target.email} khỏi dự án?`
        );

        if (!confirmed) return;

        setRemovingMemberId(memberId);
        setRoleError(null);

        try {
            await DELETE_METHOD(
                `/api/projects/${projectId}/members`,
                { memberId }
            );

            setMembers((prev) =>
                prev.filter((member) => member.id !== memberId)
            );
        } catch (err: unknown) {
            const payload = (err as {
                response?: { data?: { message?: string } };
            })?.response?.data;

            setRoleError(
                payload?.message ?? "Xóa thành viên thất bại"
            );
        } finally {
            setRemovingMemberId(null);
        }
    };

    return {
        members,
        loading,
        currentRole,
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
    };
}