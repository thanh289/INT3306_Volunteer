// English: Renders the "forgot password" form and handles the reset request.
// src/app/(auth)/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSubmitted(false);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Forgot password error:", error);
            setIsSubmitted(true); // Still show success UI
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">

                {/* We show a different view after the form is submitted */}
                {isSubmitted ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Kiểm tra email của bạn</h2>
                        <p className="mt-4 text-gray-600">
                            Nếu một tài khoản đã được tạo email đó, chúng tôi đã gửi một đường link để đặt lại mật khẩu.
                        </p>
                        <Link href="/login" className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-500">
                            &larr; Quay lại trang đăng nhập
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-900">Quên mật khẩu</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Nhập email để nhận link đặt lại mật khẩu.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Địa chỉ Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
                                >
                                    {isLoading ? 'Đang gửi...' : 'Gửi link reset'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}