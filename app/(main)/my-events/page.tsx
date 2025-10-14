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
            <h1 className="text-3xl font-bold mb-8">Sự kiện của tôi</h1>

            {/* Upcoming */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Sắp diễn ra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {registrations
                        .filter(reg => new Date(reg.event.startDateTime) >= new Date())
                        .map((reg) => (
                            <EventCard key={reg.id} event={reg.event} />
                        ))}
                </div>
                {registrations.filter(reg => new Date(reg.event.startDateTime) >= new Date()).length === 0 && (
                    <p className="text-gray-500">Bạn chưa đăng ký sự kiện nào sắp diễn ra.</p>
                )}
            </section>

            {/* Pass */}
            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Lịch sử tham gia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {registrations
                        .filter(reg => new Date(reg.event.startDateTime) < new Date())
                        .map((reg) => (
                            <EventCard key={reg.id} event={reg.event} isCompleted={reg.isCompleted} /> // complete?
                        ))}
                </div>
                {registrations.filter(reg => new Date(reg.event.startDateTime) < new Date()).length === 0 && (
                    <p className="text-gray-500">Bạn chưa tham gia sự kiện nào trong quá khứ.</p>
                )}
            </section>
        </div>
    );
}