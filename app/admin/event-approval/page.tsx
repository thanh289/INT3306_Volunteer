//A protected dashboard for Admins to manage pending events.

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AdminEventActions } from '@/components/features/admin-event-actions';
import { EventCard } from '@/components/features/event-card';

export default async function EventApprovalPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const pendingEvents = await prisma.event.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: { creator: true },
        orderBy: { createdAt: 'asc' },
    });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Admin - Duyệt sự kiện</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">
                    Sự kiện đang chờ duyệt ({pendingEvents.length})
                </h2>

                <div className="space-y-6">
                    {pendingEvents.length > 0 ? (
                        pendingEvents.map(event => (
                            <div key={event.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg bg-gray-50">
                                {/* Event Card */}
                                <div className="flex-grow w-full">
                                    <EventCard event={event} />
                                </div>
                                {/* Reject or Approve */}
                                <div className="flex-shrink-0 w-full md:w-auto">
                                    <AdminEventActions eventId={event.id} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-8 text-gray-500">
                            Không có sự kiện nào đang chờ duyệt.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}