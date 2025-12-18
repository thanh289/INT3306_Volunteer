// A client component that fetches and displays the list of pending events for admins.
// components/features/admin-event-list.tsx

"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { EventCard } from "./event-card";
import { AdminEventActions } from "./admin-event-actions";
import { Event, User } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";
import Image from "next/image";

type PendingEvent = Event & { creator: User };
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const AdminEventList = () => {
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  
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
    <>
      <div className="space-y-3">
        {pendingEvents.map((event) => (
          <div
            key={event.id}
            className="card bg-base-100 border border-base-300 hover:border-primary transition-all cursor-pointer"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="card-body p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Event Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Creator Avatar */}
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      {event.creator.imageUrl ? (
                        <Image
                          src={"/" + event.creator.imageUrl.replace(/\\/g, "/").replace(/^\/+/, "")}
                          alt={event.creator.name || "Avatar"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-primary/10 text-primary w-full h-full flex items-center justify-center text-lg font-semibold">
                          {event.creator.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Title & Creator */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {event.title}
                    </h3>
                    <p className="text-sm text-base-content/60 flex items-center gap-1">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {event.creator.name}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex items-center gap-2 text-sm text-base-content/60">
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
                    {new Date(event.startDateTime).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <AdminEventActions eventId={event.id} onSuccess={mutate} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Event Details */}
      {selectedEvent && (
        <div className="modal modal-open" onClick={() => setSelectedEvent(null)}>
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
              onClick={() => setSelectedEvent(null)}
            >
              ✕
            </button>
            
            {/* Event Image */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
              <Image
                src={"/" + (selectedEvent.imageUrl?.replace(/\\/g, "/").replace(/^\/+/, "") || "images/placeholder.png")}
                alt={selectedEvent.title}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>

            {/* Event Title and Category */}
            <div className="mb-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                <div className="badge badge-lg badge-primary gap-2">
                  {selectedEvent.category === "ENVIRONMENT" && (
                    <><img src="/images/environment.png" alt="" className="w-5 h-5" /> Môi trường</>
                  )}
                  {selectedEvent.category === "EDUCATION" && (
                    <><img src="/images/education.png" alt="" className="w-5 h-5" /> Giáo dục</>
                  )}
                  {selectedEvent.category === "HEALTHCARE" && (
                    <><img src="/images/health.png" alt="" className="w-5 h-5" /> Y tế</>
                  )}
                  {selectedEvent.category === "COMMUNITY" && (
                    <><img src="/images/community.png" alt="" className="w-5 h-5" /> Cộng đồng</>
                  )}
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  {selectedEvent.creator.imageUrl ? (
                    <Image
                      src={"/" + selectedEvent.creator.imageUrl.replace(/\\/g, "/").replace(/^\/+/, "")}
                      alt={selectedEvent.creator.name || "Avatar"}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary w-full h-full flex items-center justify-center text-xl font-semibold">
                      {selectedEvent.creator.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold">{selectedEvent.creator.name}</p>
                <p className="text-sm text-base-content/60">{selectedEvent.creator.email}</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-4">
              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
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
                <div>
                  <p className="font-medium">Thời gian</p>
                  <p className="text-sm text-base-content/70">
                    {new Date(selectedEvent.startDateTime).toLocaleString("vi-VN")} -{" "}
                    {new Date(selectedEvent.endDateTime).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
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
                <div>
                  <p className="font-medium">Địa điểm</p>
                  <p className="text-sm text-base-content/70">{selectedEvent.location}</p>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
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
                <div>
                  <p className="font-medium">Số lượng tình nguyện viên</p>
                  <p className="text-sm text-base-content/70">
                    Tối đa: {selectedEvent.maxParticipants} người
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Mô tả</h3>
              <div className="prose max-w-none text-base-content/80">
                <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <AdminEventActions eventId={selectedEvent.id} onSuccess={() => {
                mutate();
                setSelectedEvent(null);
              }} />
              <button className="btn btn-ghost" onClick={() => setSelectedEvent(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
