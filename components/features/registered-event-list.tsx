// A client component that fetches and displays the list of registered events for a volunteer.
// components/features/registered-event-list.tsx

"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import Image from "next/image";
import { EventCard } from "./event-card";
import { Event, User, Registration } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";

type RegisteredEvent = Registration & { event: Event & { creator: User } };
type ApiResponse = {
  registrations: RegisteredEvent[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRegistrations: number;
    itemsPerPage: number;
  };
};

const ITEMS_PER_PAGE = 12;
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const RegisteredEventList = () => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "past">(
    "all"
  );
  const [registrationStatus, setRegistrationStatus] = useState<
    "all" | "APPROVED" | "PENDING"
  >("all");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/registrations?all=true`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  // Client-side filtering
  const filteredRegistrations = useMemo(() => {
    if (!data?.registrations) return [];

    let filtered = data.registrations;

    // Filter by search
    if (searchInput.trim()) {
      const query = searchInput.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.event.title.toLowerCase().includes(query) ||
          reg.event.description.toLowerCase().includes(query)
      );
    }

    // Filter by time
    const now = new Date();
    if (filter === "upcoming") {
      filtered = filtered.filter(
        (reg) => new Date(reg.event.startDateTime) > now
      );
    } else if (filter === "ongoing") {
      filtered = filtered.filter(
        (reg) =>
          new Date(reg.event.startDateTime) <= now &&
          new Date(reg.event.endDateTime) >= now
      );
    } else if (filter === "past") {
      filtered = filtered.filter(
        (reg) => new Date(reg.event.endDateTime) < now
      );
    }

    // Filter by registration status
    if (registrationStatus !== "all") {
      filtered = filtered.filter((reg) => reg.status === registrationStatus);
    }

    return filtered;
  }, [data?.registrations, searchInput, filter, registrationStatus]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
  const paginatedRegistrations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRegistrations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRegistrations, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, filter, registrationStatus]);

  if (isLoading) return <EventListSkeleton count={6} />;
  if (error) return <p>Không thể tải danh sách sự kiện.</p>;
  if (!data) return <p>Không có dữ liệu.</p>;

  if (data.registrations.length === 0) {
    return (
      <div>
        <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
          <div className="card-body p-4">
            <p className="text-base-content/60">
              Bạn chưa đăng ký sự kiện nào.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div
        className="card bg-base-100 shadow-sm border border-base-300"
        style={{ overflow: "visible" }}
      >
        <div className="card-body p-4" style={{ overflow: "visible" }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Image
                  src="/images/search.png"
                  alt="Search"
                  width={18}
                  height={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input input-bordered w-full pl-10 pr-10"
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
            <div
              className="dropdown dropdown-end w-full md:w-52"
              style={{ position: "relative" }}
            >
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
                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-1 border border-base-300"
                style={{
                  position: "absolute",
                  zIndex: 9999,
                  top: "100%",
                  right: 0,
                }}
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

            {/* Registration Status Filter Dropdown */}
            <div
              className="dropdown dropdown-end w-full md:w-52"
              style={{ position: "relative" }}
            >
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200"
              >
                <span>
                  📋{" "}
                  {registrationStatus === "all"
                    ? "Tất cả trạng thái"
                    : registrationStatus === "APPROVED"
                    ? "Đã duyệt"
                    : "Chờ duyệt"}
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
                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-1 border border-base-300"
                style={{
                  position: "absolute",
                  zIndex: 9999,
                  top: "100%",
                  right: 0,
                }}
              >
                <li>
                  <button
                    onClick={() => setRegistrationStatus("all")}
                    className={`justify-start ${
                      registrationStatus === "all"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Tất cả trạng thái
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setRegistrationStatus("APPROVED")}
                    className={`justify-start ${
                      registrationStatus === "APPROVED"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Đã duyệt
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setRegistrationStatus("PENDING")}
                    className={`justify-start ${
                      registrationStatus === "PENDING"
                        ? "active bg-primary text-primary-content"
                        : ""
                    }`}
                  >
                    Chờ duyệt
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State or Events Grid */}
      {filteredRegistrations.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-base-content/60 max-w-md">
              {searchInput || filter !== "all" || registrationStatus !== "all"
                ? "Không có sự kiện nào phù hợp với bộ lọc."
                : "Bạn chưa đăng ký sự kiện nào."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRegistrations.map((reg) => (
            <EventCard
              key={reg.id}
              event={reg.event}
              registrationStatus={reg.status}
            />
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
