// English: A client component form for editing an existing event.
// components/features/edit-event-form.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Event, EventCategory } from '@prisma/client';
import { EventImageUpload } from './event-image-upload';


// date format
const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

export const EditEventForm = ({ event }: { event: Event }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [formData, setFormData] = useState({
        title: event.title,
        description: event.description,
        location: event.location,
        startDateTime: formatDateForInput(event.startDateTime),
        endDateTime: formatDateForInput(event.endDateTime),
        maxAttendees: event.maxAttendees.toString(),
        category: event.category,
    });

    // Check if we should show image upload section (from query param)
    useEffect(() => {
        if (searchParams.get('uploadImage') === 'true') {
            setShowImageUpload(true);
            // Remove the query param
            router.replace(`/events/${event.id}/edit`);
        }
    }, [searchParams, event.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.put(`/api/events/${event.id}`, formData);
            toast.success('Cập nhật sự kiện thành công!');
            router.push(`/events/${event.id}`);
            router.refresh();
        } catch (error) {
            toast.error('Cập nhật sự kiện thất bại.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            {/* Image Upload Section */}
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                    >
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ảnh sự kiện
                        </h3>
                        <button type="button" className="btn btn-ghost btn-sm btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showImageUpload ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {showImageUpload && (
                        <div className="mt-4">
                            <EventImageUpload
                                eventId={event.id}
                                currentImageUrl={event.imageUrl}
                                eventTitle={event.title}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Form */}
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Thông tin sự kiện
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Danh mục</label>
                            <select
                                name="category"
                                id="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                {Object.values(EventCategory).map((sel) => (
                                    <option key={sel} value={sel}>
                                        {sel}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                            <textarea
                                name="description"
                                id="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Địa điểm</label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                required
                                value={formData.location}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    id="startDateTime"
                                    required
                                    value={formData.startDateTime}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    id="endDateTime"
                                    required
                                    value={formData.endDateTime}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">Số người tham gia tối đa</label>
                            <input
                                type="number"
                                name="maxAttendees"
                                id="maxAttendees"
                                required
                                value={formData.maxAttendees}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};