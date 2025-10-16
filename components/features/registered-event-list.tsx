// A client component that fetches and displays the list of registered events for a volunteer.

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { EventCard } from './event-card';
import { Event, User, Registration } from '@prisma/client';

type RegisteredEvent = Registration & { event: Event & { creator: User } };
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const RegisteredEventList = () => {
    const { data: registrations, isLoading, error } = useSWR<RegisteredEvent[]>('/api/registrations', fetcher, {
        refreshInterval: 5000
    }
    );

    if (isLoading) return <p>Đang tải danh sách sự kiện...</p>;
    if (error) return <p>Không thể tải danh sách sự kiện.</p>;
    if (!registrations || registrations.length === 0) {
        return <p className="text-gray-500">Bạn chưa đăng ký sự kiện nào.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {registrations.map((reg) => (
                <EventCard key={reg.id} event={reg.event} registrationStatus={reg.status} />
            ))}
        </div>
    );
};