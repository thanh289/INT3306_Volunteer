// Client-side filtering component for events - no page reload
// components/features/event-filters-client.tsx

"use client";

import { useState, useMemo } from "react";
import { Event, User } from "@prisma/client";
import { EventCard } from "./event-card";
import Image from "next/image";

type EventWithCreator = Event & { creator: User };

interface EventFiltersClientProps {
  events: EventWithCreator[];
}

export const EventFiltersClient = ({ events }: EventFiltersClientProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"startDateTime" | "title">(
    "startDateTime"
  );

  // Client-side filtering and sorting
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) =>
        selectedCategories.includes(event.category)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return (
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
      );
    });

    return sorted;
  }, [events, selectedCategories, sortBy]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSortBy("startDateTime");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || sortBy !== "startDateTime";

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-2xl border border-base-300">
        <div className="hero-content text-center py-12">
          <div className="max-w-2xl">
            <div className="relative w-16 h-16 mb-4 mx-auto">
              <Image
                src="/images/logo.webp"
                alt="VolunteerHub Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sự kiện tình nguyện
              </span>
            </h1>
            <p className="text-lg text-base-content/70">
              Tham gia các hoạt động tình nguyện để tạo ra sự khác biệt cho cộng
              đồng
            </p>

            {/* Stats */}
            <div className="stats shadow-lg mt-8 bg-base-100 border border-base-300">
              <div className="stat place-items-center">
                <div className="stat-title">Sự kiện sắp tới</div>
                <div className="stat-value text-primary">
                  {filteredAndSortedEvents.length}
                </div>
                <div className="stat-desc">Từ {events.length} sự kiện</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Filter - Multi Select */}
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Danh mục
                  {selectedCategories.length > 0 && (
                    <span className="badge badge-primary badge-sm">
                      {selectedCategories.length}
                    </span>
                  )}
                </span>
              </label>
              <div className="flex flex-wrap gap-3 p-3 border border-base-300 rounded-lg bg-base-100">
                {[
                  { value: "ENVIRONMENT", label: "🌱 Môi trường" },
                  { value: "EDUCATION", label: "📚 Giáo dục" },
                  { value: "HEALTHCARE", label: "⚕️ Y tế - Sức khỏe" },
                  { value: "COMMUNITY", label: "🤝 Cộng đồng" },
                ].map((category) => (
                  <label
                    key={category.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                      selectedCategories.includes(category.value)
                        ? "bg-primary text-primary-content shadow-md"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryToggle(category.value)}
                      className="checkbox checkbox-sm"
                    />
                    <span className="text-sm font-medium">
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  Sắp xếp theo
                </span>
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "startDateTime" | "title")
                }
                className="select select-bordered w-full pl-3"
              >
                <option value="startDateTime">📅 Ngày bắt đầu</option>
                <option value="title">🔤 Tên (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredAndSortedEvents.length === 0 ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-base-content/60 max-w-md">
              Không có sự kiện nào phù hợp với bộ lọc của bạn. Thử thay đổi bộ
              lọc hoặc quay lại sau.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
