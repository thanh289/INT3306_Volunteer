// The main homepage, fetching and displaying a list of volunteer events with filtering.
// app/(main)/page.tsx

import prisma from "@/lib/prisma";
import { EventFiltersClient } from "@/components/features/event-filters-client";
import { dataCache } from "@/lib/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Make this page dynamic to always fetch fresh interested events
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cacheKey = "homepage:events";

  // Try to get from cache first
  let events = dataCache.get(cacheKey);

  if (!events) {
    // Fetch all published upcoming events that are not deleted
    events = await prisma.event.findMany({
      where: {
        startDateTime: { gte: new Date() },
        status: "PUBLISHED",
        isDeleted: false, // Only show non-deleted events
      },
      include: { creator: true },
      orderBy: { startDateTime: "asc" },
    });

    // Store in cache for 5 minutes (dataCache default)
    dataCache.set(cacheKey, events);
  }

  // Fetch user's interested events to avoid multiple API calls
  const session = await getServerSession(authOptions);
  let interestedEventIds: string[] = [];

  if (session?.user?.id) {
    const interestedEvents = await prisma.interestedEvent.findMany({
      where: {
        userId: session.user.id,
        eventId: { in: events.map((e: any) => e.id) },
      },
      select: { eventId: true },
    });
    interestedEventIds = interestedEvents.map((ie) => ie.eventId);
  }

  return (
    <EventFiltersClient
      events={events}
      interestedEventIds={interestedEventIds}
    />
  );
}
