// Client-side filtering component for events - no page reload
// components/features/event-filters-client.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { Event, User } from "@prisma/client";
import { EventCard } from "./event-card";
import Image from "next/image";
import Link from "next/link";

type EventWithCreator = Event & { creator: User };

interface EventFiltersClientProps {
  events: EventWithCreator[];
}

const ITEMS_PER_PAGE = 12;

export const EventFiltersClient = ({ events }: EventFiltersClientProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"startDateTime" | "title">(
    "startDateTime"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Get 5 upcoming events for carousel
  const upcomingEvents = useMemo(() => {
    return events.slice(0, 5);
  }, [events]);

  // Auto-rotate carousel every 3 seconds - scroll 1 event at a time
  useEffect(() => {
    if (upcomingEvents.length <= 3) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => {
        // Maximum index where we can still show 3 items
        const maxIndex = upcomingEvents.length - 3;
        const nextIndex = prev + 1;

        // Only wrap to beginning when we've passed the last valid position
        return nextIndex > maxIndex ? 0 : nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [upcomingEvents.length]);

  // Client-side filtering and sorting
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

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
  }, [events, selectedCategories, sortBy, searchQuery]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEvents.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedEvents, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedCategories, sortBy, searchQuery]);

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
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    sortBy !== "startDateTime" ||
    searchQuery.trim() !== "";

  return (
    <div className="space-y-6 overflow-visible">
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
          </div>
        </div>
      </div>

      {/* Upcoming Events Carousel */}
      {upcomingEvents.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-base-300 rounded-2xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Sự kiện sắp diễn ra
              </h2>
              <div className="flex gap-2">
                {Array.from({
                  length: Math.max(0, upcomingEvents.length - 2),
                }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === carouselIndex
                        ? "bg-primary w-8"
                        : "bg-base-300 hover:bg-base-400"
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${carouselIndex * (100 / 3)}%)`,
                }}
              >
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="min-w-[33.333%] px-2">
                    <div className="h-full">
                      {(() => {
                        return (
                          <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="group"
                          >
                            <div className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-xl transition-all h-full rounded-2xl overflow-hidden">
                              <figure className="relative h-48 overflow-hidden bg-base-200">
                                {event.imageUrl ? (
                                  <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <img
                                      src="/images/placeholder.png"
                                      alt="No image"
                                      className="max-w-full max-h-full object-contain p-4"
                                    />
                                  </div>
                                )}
                              </figure>
                              <div className="card-body p-4">
                                <h3 className="card-title text-base line-clamp-2 group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-base-content/60">
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
                                  {new Date(
                                    event.startDateTime
                                  ).toLocaleDateString("vi-VN")}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-base-content/60">
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
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  <span className="line-clamp-1">
                                    {event.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Navigation Arrows */}
            {upcomingEvents.length > 3 && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={() =>
                    setCarouselIndex((prev) =>
                      prev === 0 ? upcomingEvents.length - 3 : prev - 1
                    )
                  }
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
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
                <button
                  onClick={() =>
                    setCarouselIndex((prev) =>
                      prev >= upcomingEvents.length - 3 ? 0 : prev + 1
                    )
                  }
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
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
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg border border-base-300 rounded-2xl overflow-visible relative z-20">
        <div className="card-body overflow-visible">
          {/* Search bar on first row */}
          <div className="form-control w-full">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10 pr-10 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category dropdown and sort on second row */}
          <div className="flex flex-col sm:flex-row gap-4 overflow-visible">
            {/* Category Filter - Dropdown with checkboxes */}
            <div className="dropdown dropdown-end dropdown-bottom w-full sm:w-auto sm:flex-1 relative z-30">
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200 rounded-xl"
              >
                <span>📂 Danh mục</span>
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
                className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-2xl w-full sm:w-64 mt-2 border border-base-300 max-h-96 overflow-auto absolute left-0 top-full z-[120]"
              >
                {[
                  {
                    value: "ENVIRONMENT",
                    label: "Môi trường",
                    icon: "/images/environment.png",
                  },
                  {
                    value: "EDUCATION",
                    label: "Giáo dục",
                    icon: "/images/education.png",
                  },
                  {
                    value: "HEALTHCARE",
                    label: "Y tế - Sức khỏe",
                    icon: "/images/health.png",
                  },
                  {
                    value: "COMMUNITY",
                    label: "Cộng đồng",
                    icon: "/images/community.png",
                  },
                ].map((category) => (
                  <li key={category.value}>
                    <label className="label cursor-pointer justify-start gap-3 p-3 hover:bg-base-200">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => handleCategoryToggle(category.value)}
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <Image
                        src={category.icon}
                        alt={category.label}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="label-text">{category.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort Filter - Dropdown style */}
            <div className="dropdown dropdown-end dropdown-bottom w-full sm:w-auto sm:flex-1 relative z-30">
              <label
                tabIndex={0}
                className="btn btn-ghost w-full justify-between normal-case hover:bg-base-200 rounded-xl"
              >
                <span className="flex items-center gap-2">
                  <Image
                    src={
                      sortBy === "startDateTime"
                        ? "/images/calendar.png"
                        : "/images/abc.png"
                    }
                    alt={
                      sortBy === "startDateTime"
                        ? "Sắp xếp theo ngày"
                        : "Sắp xếp theo tên"
                    }
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                  <span>
                    {sortBy === "startDateTime" ? "Ngày bắt đầu" : "Tên (A-Z)"}
                  </span>
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
                className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-2xl w-full sm:w-52 mt-2 border border-base-300 max-h-96 overflow-auto absolute left-0 top-full z-[120]"
              >
                <li>
                  <button
                    onClick={() => setSortBy("startDateTime")}
                    className={`justify-start flex items-center gap-2 ${sortBy === "startDateTime"
                        ? "active bg-primary text-primary-content"
                        : ""
                      }`}
                  >
                    <Image
                      src="/images/calendar.png"
                      alt="Sắp xếp theo ngày"
                      width={18}
                      height={18}
                      className="w-4 h-4 object-contain"
                    />
                    Ngày bắt đầu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSortBy("title")}
                    className={`justify-start flex items-center gap-2 ${sortBy === "title"
                        ? "active bg-primary text-primary-content"
                        : ""
                      }`}
                  >
                    <Image
                      src="/images/abc.png"
                      alt="Sắp xếp theo tên"
                      width={18}
                      height={18}
                      className="w-4 h-4 object-contain"
                    />
                    Tên (A-Z)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {paginatedEvents.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Client-side Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`btn btn-circle btn-sm border border-base-300 ${currentPage <= 1 ? "btn-disabled" : "btn-ghost"
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

              {/* Page 1 */}
              <button
                onClick={() => setCurrentPage(1)}
                className={`btn btn-circle btn-sm border ${currentPage === 1
                    ? "btn-success text-white border-success"
                    : "btn-ghost border-base-300"
                  }`}
              >
                1
              </button>

              {/* Left Ellipsis */}
              {currentPage > 3 && (
                <span className="px-2 text-base-content/40">...</span>
              )}

              {/* Middle Pages */}
              {currentPage > 2 && currentPage < totalPages && (
                <>
                  {currentPage > 3 && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="btn btn-circle btn-sm btn-ghost border border-base-300"
                    >
                      {currentPage - 1}
                    </button>
                  )}
                  <button className="btn btn-circle btn-sm btn-success text-white border border-success">
                    {currentPage}
                  </button>
                  {currentPage < totalPages - 2 && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="btn btn-circle btn-sm btn-ghost border border-base-300"
                    >
                      {currentPage + 1}
                    </button>
                  )}
                </>
              )}

              {/* Show page 2 if current is 1 or 2 */}
              {totalPages > 1 && currentPage <= 2 && (
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`btn btn-circle btn-sm border ${currentPage === 2
                      ? "btn-success text-white border-success"
                      : "btn-ghost border-base-300"
                    }`}
                >
                  2
                </button>
              )}

              {/* Show page 3 if current is 1 */}
              {totalPages > 2 && currentPage === 1 && (
                <button
                  onClick={() => setCurrentPage(3)}
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
                >
                  3
                </button>
              )}

              {/* Show page 4 if current is 1 and total > 5 */}
              {totalPages > 5 && currentPage === 1 && (
                <button
                  onClick={() => setCurrentPage(4)}
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
                >
                  4
                </button>
              )}

              {/* Right Ellipsis */}
              {currentPage < totalPages - 2 && totalPages > 3 && (
                <span className="px-2 text-base-content/40">...</span>
              )}

              {/* Last Page */}
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`btn btn-circle btn-sm border ${currentPage === totalPages
                      ? "btn-success text-white border-success"
                      : "btn-ghost border-base-300"
                    }`}
                >
                  {totalPages}
                </button>
              )}

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className={`btn btn-circle btn-sm border border-base-300 ${currentPage >= totalPages ? "btn-disabled" : "btn-ghost"
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
        </>
      )}
    </div>
  );
};
