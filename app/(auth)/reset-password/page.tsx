// English: Renders the password reset form and handles submission.
// src/app/(auth)/reset-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Check for token existence on page load
    useEffect(() => {
        if (!token) {
            setError('Đường dẫn không hợp lệ hoặc đã hết hạn.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (!token) {
            toast.error('Token không hợp lệ.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/api/auth/reset-password', {
                token: token,
                password: formData.password,
            });
            setIsSuccess(true);
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data || 'Đặt lại mật khẩu thất bại.');
            } else {
                toast.error('Đã có lỗi không mong muốn xảy ra.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // If the process is successful, show a success message
    if (isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900">Thành công!</h2>
                    <p className="mt-4 text-gray-600">Mật khẩu của bạn đã được cập nhật.</p>
                    <Link href="/login" className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-500">
                        Đi đến trang đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    // If there's an error (like no token), show an error message
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600">Lỗi</h2>
                    <p className="mt-4 text-gray-600">{error}</p>
                    <Link href="/login" className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-500">
                        &larr; Quay lại trang đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    // The main form view
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Đặt lại mật khẩu mới</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                        <input type="password" name="password" id="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}