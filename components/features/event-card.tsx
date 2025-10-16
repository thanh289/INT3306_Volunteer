// A reusable component to display a single event's summary information.


import { Event, User, EventStatus, RegistrationStatus } from '@prisma/client';
import Link from 'next/link';

// Badge for manager
const EventStatusBadge = ({ status }: { status: EventStatus }) => {
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

// Badge for volunteer
const RegistrationStatusBadge = ({ status, isEventPast }: { status: RegistrationStatus, isEventPast: boolean }) => {
    let text = '';
    let style = '';

    switch (status) {
        case 'PENDING':
            text = 'Chờ duyệt';
            style = 'bg-yellow-100 text-yellow-800';
            break;
        case 'APPROVED':
            if (isEventPast) {
                text = 'Không hoàn thành';
                style = 'bg-gray-100 text-gray-800';
            } else {
                text = 'Đăng ký thành công';
                style = 'bg-blue-100 text-blue-800';
            }
            break;
        case 'REJECTED':
            text = 'Bị từ chối';
            style = 'bg-red-100 text-red-800';
            break;
        case 'COMPLETED':
            text = 'Đã hoàn thành';
            style = 'bg-green-100 text-green-800';
            break;
    }

    if (!text) return null;
    return (
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${style}`}>
            {text}
        </span>
    );
};

// create an object with artribute creator
type EventWithCreator = Event & {
    creator: User;
};

type EventCardProps = {
    event: EventWithCreator;
    showStatus?: boolean;
    registrationStatus?: RegistrationStatus;
};



export const EventCard = ({ event, showStatus, registrationStatus }: EventCardProps) => {
    const eventDate = new Date(event.startDateTime).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const isEventPast = new Date(event.endDateTime) < new Date();

    return (
        <Link href={`/events/${event.id}`}>
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col">
                <div className="p-6 flex-grow relative">

                    {showStatus && <EventStatusBadge status={event.status} />}
                    {registrationStatus && <RegistrationStatusBadge status={registrationStatus} isEventPast={isEventPast} />}

                    <p className="text-sm text-indigo-600 font-semibold">{event.creator.name}</p>
                    <h3 className="text-xl font-bold mt-2 text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 mt-2">{event.location}</p>
                    <p className="text-gray-500 mt-4">{eventDate}</p>
                </div>
            </div>
        </Link>
    );
};