// A client component that fetches and displays the list of created events for a manager
// using SWR for data fetching and caching.
// components/features/created-event-list.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import { EventCard } from "./event-card";
import { Event, User } from "@prisma/client";
import { EventListSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";

type CreatedEvent = Event & { creator: User };
type ApiResponse = {
  events: CreatedEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    itemsPerPage: number;
  };
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const CreatedEventList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const filter = searchParams.get("filter") || "all";
  const status = searchParams.get("status") || "all";

  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/created-events?page=${page}&filter=${filter}&status=${status}`,
    fetcher
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/created-events?${params.toString()}`);
  };

  if (isLoading) return <EventListSkeleton count={6} />;
  if (error) return <p>Không thể tải danh sách sự kiện.</p>;
  if (!data || data.events.length === 0) {
    return (
      <div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {/* Time Filters */}
          <button
            onClick={() => handleFilterChange("filter", "all")}
            className={`btn btn-sm ${
              filter === "all" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => handleFilterChange("filter", "upcoming")}
            className={`btn btn-sm ${
              filter === "upcoming" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            onClick={() => handleFilterChange("filter", "past")}
            className={`btn btn-sm ${
              filter === "past" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Đã kết thúc
          </button>
          <div className="divider divider-horizontal"></div>
          {/* Status Filters */}
          <button
            onClick={() => handleFilterChange("status", "all")}
            className={`btn btn-sm ${
              status === "all" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Tất cả trạng thái
          </button>
          <button
            onClick={() => handleFilterChange("status", "published")}
            className={`btn btn-sm ${
              status === "published" ? "btn-success" : "btn-ghost"
            }`}
          >
            Đã đăng
          </button>
          <button
            onClick={() => handleFilterChange("status", "pending_approval")}
            className={`btn btn-sm ${
              status === "pending_approval" ? "btn-warning" : "btn-ghost"
            }`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => handleFilterChange("status", "rejected")}
            className={`btn btn-sm ${
              status === "rejected" ? "btn-error" : "btn-ghost"
            }`}
          >
            Bị từ chối
          </button>
        </div>
        <p className="text-base-content/60">Bạn chưa tạo sự kiện nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-sm">Thời gian:</span>
            <button
              onClick={() => handleFilterChange("filter", "all")}
              className={`btn btn-sm ${
                filter === "all" ? "btn-primary" : "btn-ghost"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterChange("filter", "upcoming")}
              className={`btn btn-sm ${
                filter === "upcoming" ? "btn-primary" : "btn-ghost"
              }`}
            >
              Sắp diễn ra
            </button>
            <button
              onClick={() => handleFilterChange("filter", "past")}
              className={`btn btn-sm ${
                filter === "past" ? "btn-primary" : "btn-ghost"
              }`}
            >
              Đã kết thúc
            </button>
            <div className="divider divider-horizontal"></div>
            <span className="font-semibold text-sm">Trạng thái:</span>
            <button
              onClick={() => handleFilterChange("status", "all")}
              className={`btn btn-sm ${
                status === "all" ? "btn-primary" : "btn-ghost"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterChange("status", "published")}
              className={`btn btn-sm ${
                status === "published" ? "btn-success" : "btn-ghost"
              }`}
            >
              Đã đăng
            </button>
            <button
              onClick={() => handleFilterChange("status", "pending_approval")}
              className={`btn btn-sm ${
                status === "pending_approval" ? "btn-warning" : "btn-ghost"
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => handleFilterChange("status", "rejected")}
              className={`btn btn-sm ${
                status === "rejected" ? "btn-error" : "btn-ghost"
              }`}
            >
              Bị từ chối
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow border border-base-300">
        <div className="stat">
          <div className="stat-title">Tổng sự kiện</div>
          <div className="stat-value text-primary">
            {data.pagination.totalEvents}
          </div>
          <div className="stat-desc">Bạn đã tạo</div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.events.map((event) => (
          <EventCard key={event.id} event={event} showStatus={true} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          baseUrl="/created-events"
        />
      )}
    </div>
  );
};
