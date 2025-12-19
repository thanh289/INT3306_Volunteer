// A client component that fetches and displays the list of created events for a manager
// with client-side filtering for instant search.
// components/features/created-event-list.tsx

"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import { EventCard } from "./event-card";
import { Event, User } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";

type CreatedEvent = Event & { creator: User };
type ApiResponse = {
  events: CreatedEvent[];
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const ITEMS_PER_PAGE = 12;

export const CreatedEventList = () => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "past">(
    "all"
  );
  const [status, setStatus] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all events once
  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/created-events?all=true`,
    fetcher
  );

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];

    let filtered = data.events;

    // Filter by search
    if (searchInput.trim()) {
      const query = searchInput.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    // Filter by time
    const now = new Date();
    if (filter === "upcoming") {
      // Sự kiện chưa bắt đầu
      filtered = filtered.filter(
        (event) => new Date(event.startDateTime) > now
      );
    } else if (filter === "ongoing") {
      // Sự kiện đang diễn ra
      filtered = filtered.filter(
        (event) =>
          new Date(event.startDateTime) <= now &&
          new Date(event.endDateTime) >= now
      );
    } else if (filter === "past") {
      // Sự kiện đã kết thúc
      filtered = filtered.filter((event) => new Date(event.endDateTime) < now);
    }

    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter(
        (event) => event.status === status.toUpperCase()
      );
    }

    return filtered;
  }, [data?.events, searchInput, filter, status]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, filter, status]);

  if (isLoading) return <EventListSkeleton count={6} />;
  if (error) return <p>Không thể tải danh sách sự kiện.</p>;
  if (!data) return <p>Không có dữ liệu.</p>;

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

            {/* Status Filter Dropdown */}
            <div className="dropdown dropdown-end w-full md:w-52">
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200"
              >
                <span>
                  📊{" "}
                  {status === "all"
                    ? "Tất cả"
                    : status === "published"
                    ? "Đã đăng"
                    : status === "pending_approval"
                    ? "Chờ duyệt"
                    : "Bị từ chối"}
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
                    onClick={() => setStatus("all")}
                    className={`justify-start ${
                      status === "all"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Tất cả
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatus("published")}
                    className={`justify-start ${
                      status === "published"
                        ? "active bg-success text-success-content"
                        : ""
                    }`}
                  >
                    Đã đăng
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatus("pending_approval")}
                    className={`justify-start ${
                      status === "pending_approval"
                        ? "active bg-warning text-warning-content"
                        : ""
                    }`}
                  >
                    Chờ duyệt
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatus("rejected")}
                    className={`justify-start ${
                      status === "rejected"
                        ? "active bg-error text-error-content"
                        : ""
                    }`}
                  >
                    Bị từ chối
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow border border-base-300">
        <div className="stat">
          <div className="stat-title">Tổng sự kiện</div>
          <div className="stat-value text-primary">{data.events.length}</div>
          <div className="stat-desc">
            {filteredEvents.length !== data.events.length &&
              `Hiển thị ${filteredEvents.length} / ${data.events.length}`}
            {filteredEvents.length === data.events.length && "Bạn đã tạo"}
          </div>
        </div>
      </div>

      {/* Events Grid */}
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-base-content/60 max-w-md">
              {searchInput || filter !== "all" || status !== "all"
                ? "Không có sự kiện nào phù hợp với bộ lọc."
                : "Bạn chưa tạo sự kiện nào."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedEvents.map((event) => (
            <EventCard key={event.id} event={event} showStatus={true} />
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
