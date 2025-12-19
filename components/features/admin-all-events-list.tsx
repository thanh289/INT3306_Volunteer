// Client component for admin to manage all events with filters and CSV export
// components/features/admin-all-events-list.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import { Event, User, EventStatus, EventCategory } from "@prisma/client";
import Link from "next/link";
import { Download, Ban } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

type EventWithCreator = Event & {
  creator: User;
  _count?: {
    registrations: number;
  };
};

type ApiResponse = {
  events: EventWithCreator[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    itemsPerPage: number;
  };
};

export const AdminAllEventsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const categoryFilter = searchParams.get("category") || "ALL";
  const [searchInput, setSearchInput] = useState(search);
  const [isExporting, setIsExporting] = useState(false);

  const buildQueryString = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      search: search,
    });
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (categoryFilter !== "ALL") params.append("category", categoryFilter);
    return params.toString();
  };

  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/admin/events?${buildQueryString()}`,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    router.push(`/admin/event-management?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/event-management?${params.toString()}`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);

      const response = await axios.get(`/api/admin/events/export?${params}`, {
        responseType: "blob",
      });

      const bom = "\uFEFF";
      const blobWithBom = new Blob([bom, response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blobWithBom);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let fileName = "events_export.csv";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const config = {
      PUBLISHED: { text: "Đã đăng", class: "badge-success" },
      PENDING_APPROVAL: { text: "Chờ duyệt", class: "badge-warning" },
      REJECTED: { text: "Bị từ chối", class: "badge-error" },
    };
    return config[status] || config.PUBLISHED;
  };

  const getCategoryLabel = (category: EventCategory) => {
    const labels = {
      ENVIRONMENT: "Môi trường",
      EDUCATION: "Giáo dục",
      HEALTHCARE: "Y tế",
      COMMUNITY: "Cộng đồng",
    };
    return labels[category] || category;
  };

  if (error) return <p>Không thể tải danh sách sự kiện.</p>;

  return (
    <div className="space-y-4">
      {/* Filters and Export */}
      <div className="flex flex-col gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm theo tên sự kiện..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input input-bordered flex-1"
          />
          <button type="submit" className="btn btn-primary">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete("search");
                params.set("page", "1");
                router.push(`/admin/event-management?${params.toString()}`);
              }}
              className="btn btn-ghost"
            >
              Xóa
            </button>
          )}
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã đăng</option>
            <option value="PENDING_APPROVAL">Chờ duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={categoryFilter}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="ALL">Tất cả thể loại</option>
            <option value="ENVIRONMENT">Môi trường</option>
            <option value="EDUCATION">Giáo dục</option>
            <option value="HEALTHCARE">Y tế</option>
            <option value="COMMUNITY">Cộng đồng</option>
          </select>

          <div className="ml-auto">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-secondary gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Đang xuất..." : "Xuất CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {data && (
        <div className="text-sm text-base-content/60">
          Hiển thị {data.events.length} / {data.pagination.totalEvents} sự kiện
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Events Table */}
      {data && data.events.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Tên sự kiện</th>
                  <th>Người tạo</th>
                  <th>Thể loại</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id}>
                    <td className="font-medium max-w-xs">
                      <Link
                        href={`/events/${event.id}`}
                        className="hover:underline flex items-center gap-2"
                      >
                        {event.isCancelled && (
                          <Ban className="h-4 w-4 text-error" />
                        )}
                        <span className={event.isCancelled ? "text-error" : ""}>
                          {event.title}
                        </span>
                      </Link>
                      {event.isDeleted && (
                        <span className="badge badge-error badge-xs mt-1">
                          Đã xóa
                        </span>
                      )}
                    </td>
                    <td>{event.creator.name || event.creator.email}</td>
                    <td>
                      <span className="text-sm">
                        {getCategoryLabel(event.category)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          getStatusBadge(event.status).class
                        }`}
                      >
                        {getStatusBadge(event.status).text}
                      </span>
                    </td>
                    <td className="text-sm">
                      {new Date(event.startDateTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td className="text-sm">
                      {event._count?.registrations || 0} / {event.maxAttendees}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.totalPages}
                baseUrl="/admin/event-management"
              />
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {data && data.events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-base-content/60">
            {search || statusFilter !== "ALL" || categoryFilter !== "ALL"
              ? "Không tìm thấy sự kiện phù hợp"
              : "Chưa có sự kiện nào"}
          </p>
        </div>
      )}
    </div>
  );
};
