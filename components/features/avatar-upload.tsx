// Client component for uploading user avatar
// components/features/avatar-upload.tsx

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

type AvatarUploadProps = {
    currentImageUrl: string | null;
    userName: string | null;
};

export const AvatarUpload = ({ currentImageUrl, userName }: AvatarUploadProps) => {
    const router = useRouter();
    const { update } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 2MB');
            return;
        }

        //  preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        await uploadAvatar(file);
    };

    // UPLOADING
    const uploadAvatar = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post('/api/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Cập nhật ảnh đại diện thành công!');
            setPreviewUrl(response.data.imageUrl);

            await update();

            router.refresh();

        } catch (error) {
            console.error('Error uploading avatar:', error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Có lỗi xảy ra khi tải ảnh lên');
            }
            // revert 
            setPreviewUrl(currentImageUrl);

        } finally {
            setIsUploading(false);
            // clear input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // DELETE
    const handleDelete = async () => {
        if (!currentImageUrl) return;

        if (!window.confirm('Bạn chắc chắn muốn xóa ảnh đại diện?')) {
            return;
        }

        setIsUploading(true);
        try {
            await axios.delete('/api/profile/avatar');
            toast.success('Đã xóa ảnh đại diện');
            setPreviewUrl(null);

            await update();

            router.refresh();
        } catch (error) {
            console.error('Error deleting avatar:', error);
            toast.error('Có lỗi xảy ra khi xóa ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const getInitials = () => {
        if (!userName) return 'U';
        return userName.charAt(0).toUpperCase();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative">
                <div className="avatar">
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        {previewUrl ? (
                            <Image
                                src={previewUrl}
                                alt="Avatar"
                                width={128}
                                height={128}
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold w-full h-full">
                                {getInitials()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 rounded-full">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}
            </div>

            {/* Upload Buttons */}
            <div className="flex gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn btn-primary btn-sm gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {currentImageUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </button>

                {currentImageUrl && (
                    <button
                        onClick={handleDelete}
                        disabled={isUploading}
                        className="btn btn-ghost btn-sm text-error gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                    </button>
                )}
            </div>

            {/* Info Text */}
            <p className="text-xs text-base-content/60 text-center max-w-xs">
                Chấp nhận file JPG, PNG, WebP. Tối đa 2MB.
            </p>
        </div>
    );
};