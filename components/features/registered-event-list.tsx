// A client component that fetches and displays the list of registered events for a volunteer.
// components/features/registered-event-list.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import { EventCard } from "./event-card";
import { Event, User, Registration } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";

type RegisteredEvent = Registration & { event: Event & { creator: User } };
type ApiResponse = {
  registrations: RegisteredEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRegistrations: number;
    itemsPerPage: number;
  };
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const RegisteredEventList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const filter = searchParams.get("filter") || "all";

  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/registrations?page=${page}&filter=${filter}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (newFilter !== "all") {
      params.set("filter", newFilter);
    } else {
      params.delete("filter");
    }
    router.push(`/registered-events?${params.toString()}`);
  };

  if (isLoading) return <EventListSkeleton count={6} />;
  if (error) return <p>Không thể tải danh sách sự kiện.</p>;
  if (!data || data.registrations.length === 0) {
    return (
      <div>
        <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold text-sm flex items-center gap-2">
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Lọc:
              </span>
              {["all", "upcoming", "past"].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`btn btn-sm gap-2 ${
                    filter === f ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {f === "all" && (
                    <>
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
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      Tất cả
                    </>
                  )}
                  {f === "upcoming" && (
                    <>
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Sắp tới
                    </>
                  )}
                  {f === "past" && (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Đã qua
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-500">Bạn chưa đăng ký sự kiện nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-sm flex items-center gap-2">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Lọc:
            </span>
            <button
              onClick={() => handleFilterChange("all")}
              className={`btn btn-sm gap-2 ${
                filter === "all" ? "btn-primary" : "btn-ghost"
              }`}
            >
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
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Tất cả
              <span className="badge badge-sm">
                {data.pagination.totalRegistrations}
              </span>
            </button>
            <button
              onClick={() => handleFilterChange("upcoming")}
              className={`btn btn-sm gap-2 ${
                filter === "upcoming" ? "btn-primary" : "btn-ghost"
              }`}
            >
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sắp tới
            </button>
            <button
              onClick={() => handleFilterChange("past")}
              className={`btn btn-sm gap-2 ${
                filter === "past" ? "btn-primary" : "btn-ghost"
              }`}
            >
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Đã qua
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.registrations.map((reg) => (
          <EventCard
            key={reg.id}
            event={reg.event}
            registrationStatus={reg.status}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          baseUrl="/registered-events"
        />
      )}
    </div>
  );
};
