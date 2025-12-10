// A protected dashboard page for volunteers to see a summary of relevant events.
// app/(main)/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardSidebar } from "@/components/features/dashboard-sidebar";
import { DashboardFeed } from "@/components/features/dashboard-feed";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Promise.all for parallel query
  const [myUpcomingRegistrations, interestedEvents] = await Promise.all([
    // Take upcoming events user registered
    prisma.registration.findMany({
      where: {
        userId: userId,
        event: {
          startDateTime: { gte: new Date() },
          status: "PUBLISHED",
          isDeleted: false, // Only show non-deleted events
        },
      },
      take: 10,
      orderBy: { event: { startDateTime: "asc" } },
      include: { event: { include: { creator: true } } },
    }),

    // Take events user is interested in
    prisma.interestedEvent.findMany({
      where: {
        userId: userId,
        event: {
          status: "PUBLISHED",
          isDeleted: false, // Only show non-deleted events
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { event: { include: { creator: true } } },
    }),
  ]);

  const myUpcomingEvents = myUpcomingRegistrations.map((reg) => reg.event);
  const myInterestedEvents = interestedEvents.map((item) => item.event);

  return (
    <div className="flex min-h-screen">
      {/* Collapsible Sidebar */}
      <DashboardSidebar
        upcomingEvents={myUpcomingEvents}
        interestedEvents={myInterestedEvents}
      />

      {/* Main Content - Posts Feed */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Bảng tin</h1>
        <DashboardFeed />
      </main>
    </div>
  );
}
