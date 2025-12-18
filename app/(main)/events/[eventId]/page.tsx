// Renders the detailed page for a single event, fetched by its ID.
// app/(main)/events/[eventId]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RegisterEventButton } from "@/components/features/register-event-button";
import { FavoriteEventButton } from "@/components/features/favorite-event-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EventWall } from "@/components/features/event-wall";
import { EventManagementButtons } from "@/components/features/event-management-buttons";
import { Ban } from "lucide-react";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { eventId } = await params;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  // Use Promise.all for better performance
  const [event, registration] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: true,
        eventManagers: {
          select: { userId: true },
        },
      },
    }),
    userId
      ? prisma.registration.findUnique({
          where: { userId_eventId: { userId, eventId: eventId } },
        })
      : null,
  ]);

  if (!event) {
    notFound();
  }

  // Get all event manager IDs
  const eventManagerIds = event.eventManagers.map((m) => m.userId);

  // Check if current user is event manager
  const isEventManager = userId ? eventManagerIds.includes(userId) : false;

  // volunteer cannot access unpublished detail event
  if (
    event.status !== "PUBLISHED" &&
    userRole !== "ADMIN" &&
    userId !== event.creatorId &&
    !isEventManager
  ) {
    notFound();
  }

  const isRegistered = !!registration;
  const isEventEnded = new Date(event.endDateTime) < new Date();
  const canManage =
    userId === event.creatorId || userRole === "ADMIN" || isEventManager;

  // Helper for formatting date
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-base-content">
      <div className="bg-base-100 text-base-content rounded-lg shadow-lg overflow-hidden border border-base-300">
        {/* Event Image */}
        {event.imageUrl && (
          <div className="relative w-full h-64 md:h-96">
            <img
              src={"/" + event.imageUrl.replace(/\\/g, "/").replace(/^\/+/, "")}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header with name and creator */}
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white relative">
          {/* Favorite button in top right corner */}
          <div className="absolute top-4 right-4">
            <FavoriteEventButton eventId={event.id} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="avatar placeholder">
              <div className="bg-white/20 text-white rounded-full w-8 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {event.creator.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <p className="text-lg font-semibold">{event.creator.name}</p>
          </div>
          <h1 className="text-4xl font-bold mt-2">{event.title}</h1>

          {/* Event status badge for managers/admins */}
          {canManage && event.status !== "PUBLISHED" && (
            <div className="mt-4">
              <div
                className={`badge ${
                  event.status === "PENDING_APPROVAL"
                    ? "badge-warning"
                    : "badge-error"
                } gap-2`}
              >
                {event.status === "PENDING_APPROVAL"
                  ? "Đang chờ duyệt"
                  : "Đã bị từ chối"}
              </div>
            </div>
          )}

          {/* Cancelled badge */}
          {event.isCancelled && (
            <div className="mt-4 bg-error/20 border-2 border-error text-white px-4 py-3 rounded-lg flex items-center gap-3">
              <Ban className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-bold text-lg">Sự kiện đã bị hủy</div>
                {event.cancelReason && (
                  <div className="text-sm opacity-90 mt-1">
                    Lý do: {event.cancelReason}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Body with description*/}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 text-base-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Thông tin chi tiết
            </h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-base-content/90">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Thời gian
              </h3>
              <div className="pl-7 space-y-2 text-base-content/80">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-base-content">Bắt đầu:</span>
                  <span>{formatDateTime(event.startDateTime)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-base-content">Kết thúc:</span>
                  <span>{formatDateTime(event.endDateTime)}</span>
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Địa điểm & Số lượng
              </h3>
              <div className="pl-7 space-y-2 text-base-content/80">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-base-content">Địa điểm:</span>
                  <span>{event.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-base-content">Số lượng tối đa:</span>
                  <span>{event.maxAttendees} người</span>
                </p>
              </div>
            </div>
          </div>

          {/* Registry button */}
          <div className="border-t pt-6 flex justify-center items-center">
            {canManage ? (
              <EventManagementButtons event={event} />
            ) : (
              <RegisterEventButton
                eventId={event.id}
                isInitiallyRegistered={isRegistered}
                isEventEnded={isEventEnded}
                isCancelled={event.isCancelled}
                cancelReason={event.cancelReason}
                requiresRegistrationForm={event.requiresRegistrationForm}
              />
            )}
          </div>
        </div>
      </div>

      <EventWall
        eventId={event.id}
        creatorId={event.creatorId}
        isRegistered={isRegistered}
        registrationStatus={registration?.status}
        eventStatus={event.status}
        eventManagerIds={eventManagerIds}
      />
    </div>
  );
}
