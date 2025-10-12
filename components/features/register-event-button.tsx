// A client component button for registering for an event.
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

type RegisterEventButtonProps = {
    eventId: string;
};

export const RegisterEventButton = ({ eventId }: RegisterEventButtonProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        // Direct to login if haven't signed in
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`/api/events/${eventId}/register`);
            toast.success('Đăng ký tham gia thành công!');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data || 'Có lỗi xảy ra.');
            } else {
                toast.error('Có lỗi không mong muốn xảy ra.');
            }
        } finally {
            setIsLoading(false);
        }
    };



    if (status !== 'authenticated') {
        return (
            <button
                onClick={handleRegister}
                className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white bg-gray-500 border border-transparent rounded-md shadow-sm hover:bg-gray-600"
            >
                Đăng nhập để đăng ký
            </button>
        );
    }

    return (
        <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:bg-green-400"
        >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký tham gia sự kiện này'}
        </button>
    );
};