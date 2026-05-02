'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { POST_METHOD } from '@/lib/req';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await POST_METHOD('/api/forgot-password', { email });

            toast.success("Đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hòm thư email");

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setError(payload?.message ?? "Có lỗi xảy ra. Vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden rounded-xl w-full max-w-md">
            <CardHeader className="text-center pb-6 border-b border-slate-100 dark:border-slate-800/50 pt-6">
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                    Quên mật khẩu?
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-4">
                    Nhập email của bạn và chúng tôi sẽ hướng dẫn đặt lại mật khẩu.
                </div>
            </CardHeader>

            <CardContent className="pt-8 px-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold">
                            Địa chỉ Email
                        </Label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                className={cn(
                                    "pl-11 h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950",
                                    "text-slate-900 dark:text-white placeholder:text-slate-400",
                                    "focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all"
                                )}
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-1 fade-in duration-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gray-500  hover:bg-black text-white font-bold text-base rounded-lg shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2">Gửi yêu cầu <Send className="h-4 w-4" /></span>}
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-medium">
                            <ArrowLeft className="h-4 w-4" /> Quay lại trang đăng nhập
                        </Link>
                    </div>

                </form>
            </CardContent>
        </Card>
    );
}
