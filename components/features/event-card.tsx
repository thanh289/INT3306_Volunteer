// A reusable component to display a single event's summary information.
// components/features/event-card.tsx

import { Event, User, EventStatus, RegistrationStatus } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { FavoriteEventButton } from "./favorite-event-button";
import { Ban } from "lucide-react";

// Badge for manager
const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  const statusConfig = {
    PENDING_APPROVAL: {
      text: "Chờ duyệt",
      style: "bg-amber-500 text-white border-amber-600 shadow-lg",
    },
    PUBLISHED: {
      text: "Đã đăng",
      style: "bg-emerald-600 text-white border-emerald-700 shadow-lg",
    },
    REJECTED: {
      text: "Bị từ chối",
      style: "bg-rose-600 text-white border-rose-700 shadow-lg",
    },
  };
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <div className={`badge ${config.style} badge-md font-bold border-2`}>
      {config.text}
    </div>
  );
};

// Badge for volunteer
const RegistrationStatusBadge = ({
  status,
  isEventPast,
}: {
  status: RegistrationStatus;
  isEventPast: boolean;
}) => {
  let text = "";
  let style = "";

  switch (status) {
    case "PENDING":
      text = "Chờ duyệt";
      style = "bg-amber-500 text-white border-amber-600 shadow-lg";
      break;
    case "APPROVED":
      if (isEventPast) {
        text = "Không hoàn thành";
        style = "bg-slate-500 text-white border-slate-600 shadow-lg";
      } else {
        text = "Đã duyệt";
        style = "bg-sky-600 text-white border-sky-700 shadow-lg";
      }
      break;
    case "REJECTED":
      text = "Bị từ chối";
      style = "bg-rose-600 text-white border-rose-700 shadow-lg";
      break;
    case "COMPLETED":
      text = "Đã hoàn thành";
      style = "bg-emerald-600 text-white border-emerald-700 shadow-lg";
      break;
  }

  if (!text) return null;
  return (
    <div className={`badge ${style} badge-md font-bold border-2`}>{text}</div>
  );
};

// create an object with artribute creator
type EventWithCreator = Event & {
  creator: User;
  isCancelled?: boolean;
  cancelReason?: string | null;
};

type EventCardProps = {
  event: EventWithCreator;
  showStatus?: boolean;
  registrationStatus?: RegistrationStatus;
  initialIsInterested?: boolean;
};

export const EventCard = ({
  event,
  showStatus,
  registrationStatus,
  initialIsInterested,
}: EventCardProps) => {
  const eventDate = new Date(event.startDateTime).toLocaleDateString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const eventTime = new Date(event.startDateTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isEventPast = new Date(event.endDateTime) < new Date();

  // Category icons and colors
  const categoryConfig = {
    ENVIRONMENT: {
      icon: "/images/environment.png",
      color: "text-success",
      bg: "bg-success/10",
    },
    EDUCATION: {
      icon: "/images/education.png",
      color: "text-info",
      bg: "bg-info/10",
    },
    HEALTHCARE: {
      icon: "/images/health.png",
      color: "text-error",
      bg: "bg-error/10",
    },
    COMMUNITY: {
      icon: "/images/community.png",
      color: "text-warning",
      bg: "bg-warning/10",
    },
  };

  const categoryInfo =
    categoryConfig[event.category] || categoryConfig.COMMUNITY;
  const creatorAvatar = event.creator.imageUrl
    ? "/" + event.creator.imageUrl.replace(/\\/g, "/").replace(/^\/+/, "")
    : null;

  // Validate if imageUrl actually points to a file
  const hasValidImage = event.imageUrl && event.imageUrl.trim() !== "";

  return (
    <Link href={`/events/${event.id}`} className="group">
      <div className="card rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-300 h-full group-hover:-translate-y-1 group-hover:border-primary/50">
        {/* Image placeholder */}
        <figure className="relative h-36 sm:h-48 bg-base-200 overflow-hidden">
          {hasValidImage && event.imageUrl ? (
            <img
              src={"/" + event.imageUrl.replace(/\\/g, "/").replace(/^\/+/, "")}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder on error
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full bg-base-200 flex items-center justify-center"
            style={{ display: hasValidImage ? "none" : "flex" }}
          >
            <img
              src="/images/placeholder.gif"
              alt="No image"
              className="max-w-full max-h-full object-contain p-4"
            />
          </div>

          {/* Category badge overlay */}
          <div
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 ${categoryInfo.bg} backdrop-blur-md px-2 py-1 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20`}
          >
            <img
              src={categoryInfo.icon}
              alt="Category"
              className="w-4 h-4 sm:w-6 sm:h-6 object-contain"
            />
          </div>

          {/* Favorite button overlay */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <FavoriteEventButton
              eventId={event.id}
              compact
              initialIsInterested={initialIsInterested}
            />
          </div>

          {/* Status badge overlay */}
          {showStatus && (
            <div className="absolute top-10 right-2 sm:top-12 sm:right-3">
              <EventStatusBadge status={event.status} />
            </div>
          )}
          {registrationStatus && (
            <div className="absolute top-10 right-2 sm:top-12 sm:right-3">
              <RegistrationStatusBadge
                status={registrationStatus}
                isEventPast={isEventPast}
              />
            </div>
          )}

          {/* Cancelled badge overlay */}
          {event.isCancelled && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl border-2 border-amber-600">
                <Ban className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-sm">Sự kiện đã bị hủy</div>
                  {event.cancelReason && (
                    <div className="text-xs opacity-90 line-clamp-1 mt-0.5">
                      {event.cancelReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </figure>

        <div className="card-body p-4 sm:p-6">
          {/* Creator */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60">
            <div className="avatar">
              {creatorAvatar ? (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={creatorAvatar}
                    alt="Avatar"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="bg-primary/10 text-primary rounded-full w-6 flex items-center justify-center">
                  <span className="text-xs">
                    {event.creator.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <span className="font-medium">{event.creator.name}</span>
          </div>

          {/* Title */}
          <h3 className="card-title text-base sm:text-xl line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/80 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/80 font-medium mb-2 sm:mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {eventDate} • {eventTime}
            </span>
          </div>

          {/* Description */}
          <div
            className="text-xs sm:text-sm text-base-content/70 line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.description}
          </div>
        </div>
      </div>
    </Link>
  );
};
