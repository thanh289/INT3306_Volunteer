// A client component that fetches and displays the list of created events for a manager

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { EventCard } from './event-card';
import { Event, User } from '@prisma/client';

type CreatedEvent = Event & { creator: User };
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const CreatedEventList = () => {
    // Again use swr
    const { data: createdEvents, isLoading, error } = useSWR<CreatedEvent[]>('/api/created-events', fetcher);

    if (isLoading) return <p>Đang tải danh sách sự kiện...</p>;
    if (error) return <p>Không thể tải danh sách sự kiện.</p>;
    if (!createdEvents || createdEvents.length === 0) {
        return <p className="text-gray-500">Bạn chưa tạo sự kiện nào.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {createdEvents.map((event) => (
                <EventCard key={event.id} event={event} showStatus={true} />
            ))}
        </div>
    );
};