// Client component for admin to manage all events with filters and CSV export
// components/features/admin-all-events-list.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import { Event, User, EventStatus, EventCategory } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
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
      <div className="card bg-base-100 shadow-sm border border-base-300" style={{ overflow: 'visible' }}>
        <div className="card-body p-4" style={{ overflow: 'visible' }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
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
              <button type="submit" className="btn btn-primary">
                Tìm
              </button>
            </form>

            {/* Status Filter Dropdown */}
            <div className="dropdown dropdown-end w-full md:w-52" style={{ position: 'relative' }}>
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200"
              >
                <span>
                  📊{" "}
                  {statusFilter === "ALL"
                    ? "Tất cả"
                    : statusFilter === "PUBLISHED"
                      ? "Đã đăng"
                      : statusFilter === "PENDING_APPROVAL"
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
                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-1 border border-base-300"
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                  top: '100%',
                  right: 0
                }}
              >
                <li>
                  <button
                    onClick={() => handleFilterChange("status", "ALL")}
                    className={`justify-start ${statusFilter === "ALL"
                      ? "active bg-primary text-primary-content"
                      : ""
                      }`}
                  >
                    Tất cả trạng thái
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFilterChange("status", "PUBLISHED")}
                    className={`justify-start ${statusFilter === "PUBLISHED"
                      ? "active bg-success text-success-content"
                      : ""
                      }`}
                  >
                    Đã đăng
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      handleFilterChange("status", "PENDING_APPROVAL")
                    }
                    className={`justify-start ${statusFilter === "PENDING_APPROVAL"
                      ? "active bg-warning text-warning-content"
                      : ""
                      }`}
                  >
                    Chờ duyệt
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFilterChange("status", "REJECTED")}
                    className={`justify-start ${statusFilter === "REJECTED"
                      ? "active bg-error text-error-content"
                      : ""
                      }`}
                  >
                    Bị từ chối
                  </button>
                </li>
              </ul>
            </div>

            {/* Category Filter Dropdown */}
            <div className="dropdown dropdown-end w-full md:w-52">
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200"
              >
                <span>
                  📂{" "}
                  {categoryFilter === "ALL"
                    ? "Tất cả"
                    : categoryFilter === "ENVIRONMENT"
                      ? "Môi trường"
                      : categoryFilter === "EDUCATION"
                        ? "Giáo dục"
                        : categoryFilter === "HEALTHCARE"
                          ? "Y tế"
                          : "Cộng đồng"}
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
                  position: 'absolute',
                  zIndex: 9999,
                  top: '100%',
                  right: 0
                }}
              >
                <li>
                  <button
                    onClick={() => handleFilterChange("category", "ALL")}
                    className={`justify-start ${categoryFilter === "ALL"
                      ? "active bg-primary text-primary-content"
                      : ""
                      }`}
                  >
                    Tất cả thể loại
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      handleFilterChange("category", "ENVIRONMENT")
                    }
                    className={`justify-start ${categoryFilter === "ENVIRONMENT"
                      ? "active bg-primary text-primary-content"
                      : ""
                      }`}
                  >
                    🌱 Môi trường
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFilterChange("category", "EDUCATION")}
                    className={`justify-start ${categoryFilter === "EDUCATION"
                      ? "active bg-primary text-primary-content"
                      : ""
                      }`}
                  >
                    📚 Giáo dục
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFilterChange("category", "HEALTHCARE")}
                    className={`justify-start ${categoryFilter === "HEALTHCARE"
                      ? "active bg-primary text-primary-content"
                      : ""
                      }`}
                  >
                    ⚕️ Y tế
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFilterChange("category", "COMMUNITY")}
                    className={`justify-start ${categoryFilter === "COMMUNITY"
                      ? "active bg-primary text-primary-content"
                      : ""
                      }`}
                  >
                    🤝 Cộng đồng
                  </button>
                </li>
              </ul>
            </div>

            {/* Export Button */}
            <div className="flex-none">
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

      {/* Events Table with horizontal scroll on small screens */}
      {data && data.events.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-sm">
            <table className="table table-zebra text-sm min-w-[960px]">
              <thead className="bg-base-200/80">
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
                    <td className="whitespace-nowrap">
                      {event.creator.name || event.creator.email}
                    </td>
                    <td>
                      <span className="text-sm">
                        {getCategoryLabel(event.category)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadge(event.status).class
                          }`}
                      >
                        {getStatusBadge(event.status).text}
                      </span>
                    </td>
                    <td className="text-sm whitespace-nowrap">
                      {new Date(event.startDateTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td className="text-sm whitespace-nowrap">
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
