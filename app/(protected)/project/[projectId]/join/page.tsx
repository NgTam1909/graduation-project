"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GET_METHOD, POST_METHOD } from "@/lib/req";
import {JoinInfo} from "@/types/project"


export default function ProjectJoinPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params?.projectId;
    const [info, setInfo] = useState<JoinInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!projectId) return;
            setLoading(true);
            setError(null);
            try {
                const data = (await GET_METHOD(
                    `/api/projects/${projectId}/join`
                )) as JoinInfo;
                if (active) setInfo(data);
            } catch (err: unknown) {
                const payload = (err as { response?: { data?: { message?: string } } })?.response
                    ?.data;
                if (active) setError(payload?.message ?? "Failed to load project");
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [projectId]);

    useEffect(() => {
        let active = true;
        const checkAuth = async () => {
            try {
                await GET_METHOD("/api/auth/me");
                if (active) setIsAuthed(true);
            } catch {
                if (active) setIsAuthed(false);
            }
        };
        checkAuth();
        return () => {
            active = false;
        };
    }, []);

    const handleJoin = async () => {
        if (!projectId) return;
        setJoining(true);
        setError(null);
        try {
            await POST_METHOD(`/api/projects/${projectId}/join`, {});
            setInfo((prev) =>
                prev
                    ? {
                          ...prev,
                          isMember: true,
                      }
                    : prev
            );
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response
                ?.data;
            setError(payload?.message ?? "Failed to join project");
        } finally {
            setJoining(false);
        }
    };

    const redirectUrl = projectId ? `/login?redirect=/project/${projectId}/join` : "/login";

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center gap-6 p-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Tham gia dự án</h1>
            </div>

            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!loading && error && (
                <p className="text-sm text-red-500" role="alert">
                    {error}
                </p>
            )}

            {!loading && info && (
                <div className="space-y-4 rounded-lg border bg-background p-4">
                    <div>
                        <div className="text-sm text-muted-foreground">Project</div>
                        <div className="text-base font-medium">{info.title}</div>
                    </div>

                    {!info.isPublic && (
                        <p className="text-sm text-muted-foreground">
                            Đây là dự án riêng tư cần lời mời từ admin của dự án.
                        </p>
                    )}

                    {info.isPublic && !isAuthed && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Hãy đăng nhập để tham gia dự án.
                            </p>
                            <Button asChild>
                                <Link href={redirectUrl}>Đăng nhập</Link>
                            </Button>
                        </div>
                    )}

                    {info.isPublic && isAuthed && (
                        <div className="space-y-2">
                            {info.isMember ? (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Bạn đã là thành viên dự án.
                                    </p>
                                    <Button asChild>
                                        <Link href={`/project/${info.projectId}/tasks`}>
                                            Đi tới dự án
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleJoin} disabled={joining}>
                                    {joining ? "Joining..." : "Request to join"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
