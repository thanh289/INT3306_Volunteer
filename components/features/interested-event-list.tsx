// A client component that displays the list of interested events for a user
// components/features/interested-event-list.tsx

"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import { EventCard } from "./event-card";
import { Event, User } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";

type InterestedEventItem = {
  id: string;
  createdAt: Date;
  userId: string;
  eventId: string;
  event: Event & { creator: User };
};

type ApiResponse = {
  interestedEvents: InterestedEventItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalInterestedEvents: number;
    itemsPerPage: number;
  };
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const ITEMS_PER_PAGE = 12;

export const InterestedEventList = () => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "past">(
    "all"
  );
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all interested events once
  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/interested-events?all=true`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    if (!data?.interestedEvents) return [];

    let filtered = data.interestedEvents;

    // Filter by search
    if (searchInput.trim()) {
      const query = searchInput.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.event.title.toLowerCase().includes(query) ||
          item.event.description.toLowerCase().includes(query)
      );
    }

    // Filter by time
    const now = new Date();
    if (filter === "upcoming") {
      filtered = filtered.filter(
        (item) => new Date(item.event.startDateTime) > now
      );
    } else if (filter === "ongoing") {
      filtered = filtered.filter(
        (item) =>
          new Date(item.event.startDateTime) <= now &&
          new Date(item.event.endDateTime) >= now
      );
    } else if (filter === "past") {
      filtered = filtered.filter(
        (item) => new Date(item.event.endDateTime) < now
      );
    }

    return filtered;
  }, [data?.interestedEvents, searchInput, filter]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, filter]);

  if (isLoading) return <EventListSkeleton count={6} />;
  if (error) return <p>Không thể tải danh sách sự kiện quan tâm.</p>;
  if (!data) return <p>Không có dữ liệu.</p>;

  if (data.interestedEvents.length === 0) {
    return (
      <div>
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body items-center text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-base-200 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Chưa có sự kiện quan tâm
            </h3>
            <p className="text-base-content/60 max-w-md">
              Bạn chưa đánh dấu sự kiện nào là yêu thích. Hãy nhấn vào icon trái
              tim trên các sự kiện để thêm vào danh sách quan tâm.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm sự kiện..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input input-bordered w-full pr-10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Time Filter Dropdown */}
            <div className="dropdown dropdown-end w-full md:w-52">
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200"
              >
                <span>
                  ⏰{" "}
                  {filter === "all"
                    ? "Tất cả"
                    : filter === "upcoming"
                    ? "Sắp diễn ra"
                    : filter === "ongoing"
                    ? "Đang diễn ra"
                    : "Đã kết thúc"}
                </span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-1 border border-base-300"
              >
                <li>
                  <button
                    onClick={() => setFilter("all")}
                    className={`justify-start ${
                      filter === "all"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Tất cả
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter("upcoming")}
                    className={`justify-start ${
                      filter === "upcoming"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Sắp diễn ra
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter("ongoing")}
                    className={`justify-start ${
                      filter === "ongoing"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Đang diễn ra
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter("past")}
                    className={`justify-start ${
                      filter === "past"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Đã kết thúc
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State or Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body items-center text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-base-200 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchInput || filter !== "all"
                ? "Không tìm thấy sự kiện"
                : "Chưa có sự kiện quan tâm"}
            </h3>
            <p className="text-base-content/60 max-w-md">
              {searchInput || filter !== "all"
                ? "Không có sự kiện nào phù hợp với bộ lọc."
                : "Bạn chưa đánh dấu sự kiện nào là yêu thích. Hãy nhấn vào icon trái tim trên các sự kiện để thêm vào danh sách quan tâm."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedEvents.map((item) => (
            <EventCard key={item.id} event={item.event} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={`btn btn-circle btn-sm border border-base-300 ${
              currentPage <= 1 ? "btn-disabled" : "btn-ghost"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`btn btn-circle btn-sm border ${
                currentPage === page
                  ? "btn-primary"
                  : "btn-ghost border-base-300"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className={`btn btn-circle btn-sm border border-base-300 ${
              currentPage >= totalPages ? "btn-disabled" : "btn-ghost"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
