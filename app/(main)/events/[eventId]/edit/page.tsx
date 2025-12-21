// A protected page for editing an existing event.
// app/(main)/events/[eventId]/edit/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditEventForm } from "@/components/features/edit-event-form";

type EditEventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions);
  const { eventId } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      eventManagers: userId
        ? {
          where: { userId },
        }
        : false,
    },
  });

  if (!event) {
    notFound();
  }

  // Check if user is admin, creator, or event manager
  const isAdmin = userRole === "ADMIN";
  const isCreator = event.creatorId === userId;
  const isEventManager = event.eventManagers && event.eventManagers.length > 0;

  if (!isAdmin && !isCreator && !isEventManager) {
    redirect(`/events/${eventId}`);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 text-base-content">
      <h1 className="text-3xl font-bold mb-8">Chỉnh sửa sự kiện</h1>
      <div className="bg-base-100 text-base-content p-8 rounded-lg shadow-md border border-base-300">
        <EditEventForm event={event} />
      </div>
    </div>
  );
}
