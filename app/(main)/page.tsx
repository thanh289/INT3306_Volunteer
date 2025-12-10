// The main homepage, fetching and displaying a list of volunteer events with filtering.
// app/(main)/page.tsx

import prisma from "@/lib/prisma";
import { EventFiltersClient } from "@/components/features/event-filters-client";

export default async function HomePage() {
  // Fetch all published upcoming events that are not deleted
  const events = await prisma.event.findMany({
    where: {
      startDateTime: { gte: new Date() },
      status: "PUBLISHED",
      isDeleted: false, // Only show non-deleted events
    },
    include: { creator: true },
    orderBy: { startDateTime: "asc" },
  });

  return <EventFiltersClient events={events} />;
}
