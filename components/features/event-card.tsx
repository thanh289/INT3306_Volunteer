// A reusable component to display a single event's summary information.


import { Event, Organization } from '@prisma/client';
import Link from 'next/link';

// create an object with artribute Organization
type EventWithOrganization = Event & {
    organization: Organization;
};

type EventCardProps = {
    event: EventWithOrganization;
};

export const EventCard = ({ event }: EventCardProps) => {
    const eventDate = new Date(event.startDateTime).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Link href={`/events/${event.id}`}>
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <div className="p-6">
                    <p className="text-sm text-indigo-600 font-semibold">{event.organization.name}</p>
                    <h3 className="text-xl font-bold mt-2 text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 mt-2">{event.location}</p>
                    <p className="text-gray-500 mt-4">{eventDate}</p>
                </div>
            </div>
        </Link>
    );
};