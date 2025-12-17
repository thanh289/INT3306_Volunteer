// A protected page for event managers to see the list of registered volunteers.
// app/(main)/events/[eventId]/manage/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ParticipantList } from "@/components/features/participant-list";
import { EventManagerManagement } from "@/components/features/event-manager-management";
import { EventActions } from "@/components/features/event-actions";
import { EventPostSettings } from "@/components/features/event-post-settings";
import { RegistrationQuestionsManager } from "@/components/features/registration-questions-manager";

type ManageEventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function ManageEventPage({
  params,
}: ManageEventPageProps) {
  const session = await getServerSession(authOptions);
  const { eventId } = await params;

  // Check session first
  if (!session?.user?.id) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      eventManagers: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Check if user is admin, creator, or assigned event manager
  const isAdmin = session.user.role === "ADMIN";
  const isCreator = event.creatorId === session.user.id;
  const isEventManager = event.eventManagers.length > 0;

  if (!isAdmin && !isCreator && !isEventManager) {
    redirect(`/events/${eventId}`);
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        href={`/events/${eventId}`}
        className="text-indigo-600 hover:underline"
      >
        &larr; Quay lại trang sự kiện
      </Link>
      <h1 className="text-3xl font-bold mt-4">Quản lý sự kiện</h1>
      <p className="text-xl text-gray-700 mb-8">{event.title}</p>

      <div className="space-y-6">
        {/* Registration Questions Manager */}
        <RegistrationQuestionsManager
          eventId={eventId}
          initialEnabled={event.requiresRegistrationForm}
        />

        {/* Event Manager Management */}
        <EventManagerManagement
          eventId={eventId}
          eventTitle={event.title}
          creatorId={event.creatorId}
        />

        {/* Post Settings */}
        <EventPostSettings event={event} />

        {/* Participant List */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <ParticipantList eventId={eventId} />
        </div>

        {/* Event Actions (Cancel, Restore, Delete) */}
        <EventActions
          event={event}
          isAdmin={isAdmin}
          isCreator={isCreator}
          canManage={isAdmin || isCreator || isEventManager}
        />
      </div>
    </div>
  );
}
