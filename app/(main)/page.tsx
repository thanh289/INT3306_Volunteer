// The main homepage, fetching and displaying a list of volunteer events with filtering.

import prisma from '@/lib/prisma';
import { EventCard } from '@/components/features/event-card';
import { EventFilters } from '@/components/features/event-filters';
import { EventCategory, Prisma } from '@prisma/client';

type HomePageProps = {
    searchParams: Promise<{
        category?: string;
        sortBy?: string;
    }>;
};
export default async function HomePage({ searchParams }: HomePageProps) {

    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams.category;
    const sortBy = resolvedSearchParams.sortBy || 'startDateTime';

    // Dynamic query
    const where: Prisma.EventWhereInput = {
        startDateTime: { gte: new Date() },
        // ...: only use the category filter if it exists
        ...(category && { category: category as EventCategory }),
    };

    const orderBy: Prisma.EventOrderByWithRelationInput =
        sortBy === 'title' ? { title: 'asc' } : { startDateTime: 'asc' };

    // Take filtered data
    const events = await prisma.event.findMany({
        where,
        include: { creator: true },
        orderBy,
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Các Sự kiện Sắp diễn ra</h1>

            {/* Add filter */}
            <EventFilters />

            {events.length === 0 ? (
                <p>Không tìm thấy sự kiện nào phù hợp.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}