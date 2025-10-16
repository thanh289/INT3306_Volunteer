// A protected page displaying all events a user has registered for.

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { EventCard } from '@/components/features/event-card';

export default async function MyEventsPage() {

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login');
    }
    const userId = session.user.id;

    // take all registration of the user
    const registrations = await prisma.registration.findMany({
        where: {
            userId: userId,
        },
        include: {
            event: {
                include: {
                    creator: true,
                },
            },
        },
        orderBy: {
            event: {
                startDateTime: 'desc',
            },
        },
    });




    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Sự kiện đã đăng ký</h1>

            {registrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {registrations.map((reg) => (
                        <EventCard key={reg.id} event={reg.event} registrationStatus={reg.status} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Bạn chưa đăng ký sự kiện nào.</p>
            )}
        </div>
    );
}