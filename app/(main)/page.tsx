// The main homepage, fetching and displaying a list of volunteer events.

import prisma from '@/lib/prisma';
import { EventCard } from '@/components/features/event-card';

// Biến trang chủ thành một Server Component bằng cách dùng 'async'
export default async function HomePage() {
    // fetch db from sv
    const events = await prisma.event.findMany({
        where: {
            startDateTime: {
                gte: new Date(), // Only take events didn't start
            },
        },
        include: {
            organization: true,
        },
        orderBy: {
            startDateTime: 'asc',
        },
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Các Sự kiện Sắp diễn ra</h1>
            {/* display */}
            {events.length === 0 ? (
                <p>Hiện chưa có sự kiện nào sắp diễn ra.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        // React need the key
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}