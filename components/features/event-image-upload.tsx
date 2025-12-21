// Client component for uploading event image
// components/features/event-image-upload.tsx

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

type EventImageUploadProps = {
    eventId: string;
    currentImageUrl: string | null;
    eventTitle: string;
};

export const EventImageUpload = ({ eventId, currentImageUrl, eventTitle }: EventImageUploadProps) => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const formatImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        return "/" + url.replace(/\\/g, "/").replace(/^\/+/, "");
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(formatImageUrl(currentImageUrl));

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        await uploadImage(file);
    };

    // UPLOADING
    const uploadImage = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(`/api/events/${eventId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data);
            toast.success('Cập nhật ảnh sự kiện thành công!');

            const newImageUrl = formatImageUrl(response.data.imageUrl);
            console.log('Formatted image URL:', newImageUrl);
            setPreviewUrl(newImageUrl ? `${newImageUrl}?t=${Date.now()}` : null);

            mutate(() => true, undefined, { revalidate: true });

            router.refresh();

        } catch (error) {
            console.error('Error uploading event image:', error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Có lỗi xảy ra khi tải ảnh lên');
            }
            setPreviewUrl(formatImageUrl(currentImageUrl));

        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // DELETE
    const handleDelete = async () => {
        if (!currentImageUrl) return;

        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh sự kiện?')) {
            return;
        }

        setIsUploading(true);
        try {
            await axios.delete(`/api/events/${eventId}/image`);
            toast.success('Đã xóa ảnh sự kiện');
            setPreviewUrl(null);

            mutate(() => true, undefined, { revalidate: true });

            router.refresh();
        } catch (error) {
            console.error('Error deleting event image:', error);
            toast.error('Có lỗi xảy ra khi xóa ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-semibold">Ảnh sự kiện</span>
            </label>

            {/* Preview */}
            <div className="relative w-full h-64 bg-base-200 rounded-lg overflow-hidden border-2 border-dashed border-base-300 mb-4 mt-2">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={eventTitle}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mt-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Chưa có ảnh sự kiện</p>
                    </div>
                )}

                {/* Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100/80">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}
            </div>

            {/* Upload */}
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
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn btn-outline btn-sm gap-2 flex-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {currentImageUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </button>

                {currentImageUrl && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isUploading}
                        className="btn btn-outline btn-error btn-sm gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa ảnh
                    </button>
                )}
            </div>

            {/* Info */}
            <label className="label">
                <span className="label-text-alt text-base-content/60 mt-3">
                    Chấp nhận file JPG, PNG, WebP. Tối đa 5MB.
                </span>
            </label>
        </div>
    );
};