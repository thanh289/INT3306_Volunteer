// A protected page for event managers to see a list of events they created.


import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { EventCard } from '@/components/features/event-card';

export default async function MyCreatedEventsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'EVENT_MANAGER' && session.user.role !== 'ADMIN')) {
        redirect('/');
    }

    // Take all events created by this manager
    const events = await prisma.event.findMany({
        where: {
            creatorId: session.user.id,
        },
        include: {
            creator: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Sự kiện tôi đã tạo</h1>

            {events.length === 0 ? (
                <p className="text-gray-500">Bạn chưa tạo sự kiện nào.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Use event card */}
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}