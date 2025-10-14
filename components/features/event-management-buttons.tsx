// Client component for event management buttons (Edit, Delete)


'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Event } from '@prisma/client';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Props = {
    event: Event;
};

export const EventManagementButtons = ({ event }: Props) => {
    const { data: session } = useSession();
    const router = useRouter();


    const canManage = session?.user && (session.user.id === event.creatorId || session.user.role === 'ADMIN');

    if (!canManage) {
        return null; // show nothing if have no permit
    }

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác.')) {
            try {
                await axios.delete(`/api/events/${event.id}`);
                toast.success('Xóa sự kiện thành công!');
                router.push('/'); // back to home page
                router.refresh();
            } catch (error) {
                toast.error('Xóa sự kiện thất bại.');
                console.error(error);
            }
        }
    };

    return (
        <div className="mt-6 flex items-center justify-end gap-4 border-t pt-6">
            <Link
                href={`/events/${event.id}/manage`}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
                Quản lý
            </Link>
            <Link
                href={`/events/${event.id}/edit`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                Sửa
            </Link>
            <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
                Xóa
            </button>
        </div>
    );
};