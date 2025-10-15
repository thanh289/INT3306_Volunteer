// A reusable component to display a single event's summary information.


import { Event, User, EventStatus } from '@prisma/client';
import Link from 'next/link';

const StatusBadge = ({ status }: { status: EventStatus }) => {
    const statusConfig = {
        PENDING_APPROVAL: { text: 'Chờ duyệt', style: 'bg-yellow-100 text-yellow-800' },
        PUBLISHED: { text: 'Đã đăng', style: 'bg-green-100 text-green-800' },
        REJECTED: { text: 'Bị từ chối', style: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    if (!config) return null;
    return (
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${config.style}`}>
            {config.text}
        </span>
    );
};

// create an object with artribute creator
type EventWithCreator = Event & {
    creator: User;
};

type EventCardProps = {
    event: EventWithCreator;
    isCompleted?: boolean;
    showStatus?: boolean;
};



export const EventCard = ({ event, isCompleted, showStatus }: EventCardProps) => {
    const eventDate = new Date(event.startDateTime).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Link href={`/events/${event.id}`}>
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col">
                <div className="p-6 flex-grow relative">
                    {isCompleted && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            ĐÃ HOÀN THÀNH
                        </span>
                    )}
                    {showStatus && <StatusBadge status={event.status} />}
                    <p className="text-sm text-indigo-600 font-semibold">{event.creator.name}</p>
                    <h3 className="text-xl font-bold mt-2 text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 mt-2">{event.location}</p>
                    <p className="text-gray-500 mt-4">{eventDate}</p>
                </div>
            </div>
        </Link>
    );
};