// Client component with actions for a single registration (e.g., mark complete).

'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Registration } from '@prisma/client';

type Props = {
    registration: Registration;
};

export const RegistrationActions = ({ registration }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleToggleComplete = () => {
        startTransition(async () => {
            try {
                await axios.patch(`/api/registrations/${registration.id}`, {
                    isCompleted: !registration.isCompleted, // Gửi giá trị ngược lại
                });
                toast.success('Cập nhật trạng thái thành công!');
                router.refresh();
            } catch (error) {
                toast.error(`Cập nhật thất bại: ${error}`);
            }
        });
    };

    return (
        <button
            onClick={handleToggleComplete}
            disabled={isPending}
            className={`px-3 py-1 text-xs font-medium rounded-full disabled:opacity-50 ${registration.isCompleted
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
        >
            {isPending ? 'Đang xử lý...' : registration.isCompleted ? 'Hủy hoàn thành' : 'Đánh dấu hoàn thành'}
        </button>
    );
};