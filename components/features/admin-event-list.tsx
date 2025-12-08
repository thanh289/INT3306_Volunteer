// A client component that fetches and displays the list of pending events for admins.
// components/features/admin-event-list.tsx

"use client";

import useSWR from "swr";
import axios from "axios";
import { EventCard } from "./event-card";
import { AdminEventActions } from "./admin-event-actions";
import { Event, User } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";

type PendingEvent = Event & { creator: User };
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const AdminEventList = () => {
  const {
    data: pendingEvents,
    isLoading,
    error,
    mutate,
  } = useSWR<PendingEvent[]>("/api/admin/pending-events", fetcher, {
    refreshInterval: 30000, // ask sv after each 30s
  });

  if (isLoading) return <EventListSkeleton count={3} />;
  if (error)
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Không thể tải danh sách sự kiện. Vui lòng thử lại.</span>
      </div>
    );
  if (!pendingEvents || pendingEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-16 w-16 text-base-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-4 text-base-content/60 text-lg">
          Không có sự kiện nào đang chờ duyệt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingEvents.map((event) => (
        <div
          key={event.id}
          className="card bg-base-100 border border-base-300 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-grow">
                <EventCard event={event} />
              </div>
              <div className="flex-shrink-0">
                <AdminEventActions eventId={event.id} onSuccess={mutate} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
