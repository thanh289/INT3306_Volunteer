// Renders the password reset form and handles submission.
// app/(auth)/reset-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AuthContainer from '@/components/auth/AuthContainer';
import AuthInput from '@/components/auth/AuthInput';
import { validatePassword, PASSWORD_RULES } from '@/lib/validations/auth';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);


    // Check for token existence on page load
    useEffect(() => {
        if (!token) {
            toast.error('Đường dẫn không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.');
            router.push('/forgot-password');
        }
    }, [token, router]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Reset each time type
        if (name === 'password' && passwordError) {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check pw requirement
        const passwordValidationError = validatePassword(formData.password);
        if (passwordValidationError) {
            // setPasswordError(passwordValidationError);
            toast.error(passwordValidationError);
            return;
        }

        // Check pw match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp.');
            return;
        }

        // Check token
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
                // Extract the message if it's an object, otherwise use the data as-is
                const errorData = error.response?.data;
                const errorMessage = typeof errorData === 'object' && errorData?.message
                    ? errorData.message
                    : typeof errorData === 'string'
                        ? errorData
                        : 'Đặt lại mật khẩu thất bại.';
                toast.error(errorMessage);
            } else {
                toast.error('Đã có lỗi không mong muốn xảy ra.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Success state
    if (isSuccess) {
        return (
            <AuthContainer title="Thành công!" subtitle="">
                <div className="text-center py-6">
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Mật khẩu đã được cập nhật</h3>
                    <p className="text-base-content/60 mb-6">
                        Bạn có thể đăng nhập với mật khẩu mới của mình ngay bây giờ.
                    </p>
                    <Link href="/login" className="btn btn-primary gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Đi đến trang đăng nhập
                    </Link>
                </div>
            </AuthContainer>
        );
    }


    // Main form
    return (
        <AuthContainer title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản của bạn">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <AuthInput
                        id="password"
                        name="password"
                        type="password"
                        label="Mật khẩu mới"
                        value={formData.password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        error={passwordError}
                        autoComplete="new-password"
                    />
                </div>

                <AuthInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Xác nhận mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                />

                <div className="alert text-sm mt-4">
                    <div className="text-xs">
                        <p className="font-semibold mb-2">Yêu cầu mật khẩu:</p>
                        <ul className="space-y-1">
                            <li className={formData.password.length >= 8 ? 'text-success' : ''}>
                                {formData.password.length >= 8 ? '✓' : '○'} Ít nhất 8 ký tự
                            </li>
                            <li className={PASSWORD_RULES.hasUppercase.test(formData.password) ? 'text-success' : ''}>
                                {PASSWORD_RULES.hasUppercase.test(formData.password) ? '✓' : '○'} Có chữ hoa (A-Z)
                            </li>
                            <li className={PASSWORD_RULES.hasLowercase.test(formData.password) ? 'text-success' : ''}>
                                {PASSWORD_RULES.hasLowercase.test(formData.password) ? '✓' : '○'} Có chữ thường (a-z)
                            </li>
                            <li className={PASSWORD_RULES.hasNumber.test(formData.password) ? 'text-success' : ''}>
                                {PASSWORD_RULES.hasNumber.test(formData.password) ? '✓' : '○'} Có số (0-9)
                            </li>
                            <li className={PASSWORD_RULES.hasSpecial.test(formData.password) ? 'text-success' : ''}>
                                {PASSWORD_RULES.hasSpecial.test(formData.password) ? '✓' : '○'} Có ký tự đặc biệt (@$!%*?&#)
                            </li>
                        </ul>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full mt-6 gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Lưu mật khẩu mới
                        </>
                    )}
                </button>
            </form>
        </AuthContainer>
    );
}