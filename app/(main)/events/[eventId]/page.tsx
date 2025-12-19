// Renders the detailed page for a single event, fetched by its ID.
// app/(main)/events/[eventId]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { RegisterEventButton } from "@/components/features/register-event-button";
import { FavoriteEventButton } from "@/components/features/favorite-event-button";
import { InviteEventButton } from "@/components/features/invite-event-button";
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
    <div className="min-h-screen bg-base-200 -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8">
      {/* Event Image - Full width at top */}
      <div className="relative w-full h-80 md:h-[400px] bg-base-300 overflow-hidden">
        <Image
          src={
            event.imageUrl
              ? "/" + event.imageUrl.replace(/\\/g, "/").replace(/^\/+/, "")
              : "/images/placeholder.png"
          }
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Title + Event Wall */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Title Section */}
            <div className="bg-base-100 rounded-2xl shadow-md p-6 border border-base-300">
              {/* Creator info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-white rounded-full w-10 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {event.creator.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-base-content">
                    {event.creator.name}
                  </p>
                  <p className="text-sm text-base-content/60">Người tạo</p>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                {event.title}
              </h1>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                {canManage && event.status !== "PUBLISHED" && (
                  <div
                    className={`badge ${
                      event.status === "PENDING_APPROVAL"
                        ? "bg-amber-500 text-white border-amber-600 border-2"
                        : "bg-rose-600 text-white border-rose-700 border-2"
                    } gap-2 font-bold shadow-lg`}
                  >
                    {event.status === "PENDING_APPROVAL"
                      ? "Đang chờ duyệt"
                      : "Đã bị từ chối"}
                  </div>
                )}
                {event.isCancelled && (
                  <div className="badge bg-error text-white border-error border-2 font-bold shadow-lg">
                    Đã hủy
                  </div>
                )}
              </div>

              {/* Cancelled reason */}
              {event.isCancelled && event.cancelReason && (
                <div className="mt-4 bg-error/10 border border-error/30 text-base-content px-4 py-3 rounded-xl flex items-center gap-3">
                  <Ban className="h-5 w-5 text-error flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold">Lý do hủy:</span>{" "}
                    {event.cancelReason}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-base-300">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-base-content">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Thông tin chi tiết
                </h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap text-base-content/90">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Event Wall */}
            <EventWall
              eventId={event.id}
              creatorId={event.creatorId}
              isRegistered={isRegistered}
              registrationStatus={registration?.status}
              eventStatus={event.status}
              eventManagerIds={eventManagerIds}
            />
          </div>

          {/* Right Sidebar - Sticky Event Info */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Event Details Card */}
              <div className="bg-base-100 rounded-2xl shadow-md p-6 border border-base-300">
                <h3 className="text-lg font-bold mb-4 text-base-content">
                  Chi tiết sự kiện
                </h3>

                {/* Category */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-base-content text-sm">
                        Thể loại
                      </p>
                      <p className="text-sm text-base-content/80">
                        {event.category === "ENVIRONMENT" && "Môi trường"}
                        {event.category === "EDUCATION" && "Giáo dục"}
                        {event.category === "HEALTHCARE" && "Y tế"}
                        {event.category === "COMMUNITY" && "Cộng đồng"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
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
                    <div className="flex-1">
                      <p className="font-semibold text-base-content text-sm">
                        Bắt đầu
                      </p>
                      <p className="text-sm text-base-content/80">
                        {formatDateTime(event.startDateTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
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
                    <div className="flex-1">
                      <p className="font-semibold text-base-content text-sm">
                        Kết thúc
                      </p>
                      <p className="text-sm text-base-content/80">
                        {formatDateTime(event.endDateTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
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
                    <div className="flex-1">
                      <p className="font-semibold text-base-content text-sm">
                        Địa điểm
                      </p>
                      <p className="text-sm text-base-content/80">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Max attendees */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base-content text-sm">
                        Số lượng tối đa
                      </p>
                      <p className="text-sm text-base-content/80 break-words">
                        {event.maxAttendees} người
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-base-300">
                  {canManage ? (
                    <EventManagementButtons event={event} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <RegisterEventButton
                        eventId={event.id}
                        isInitiallyRegistered={isRegistered}
                        isEventEnded={isEventEnded}
                        isCancelled={event.isCancelled}
                        cancelReason={event.cancelReason}
                        requiresRegistrationForm={
                          event.requiresRegistrationForm
                        }
                      />
                      <InviteEventButton eventId={event.id} />
                      <FavoriteEventButton eventId={event.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
