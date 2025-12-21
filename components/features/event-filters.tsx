// A client component that provides UI for filtering and sorting events.
// Not directly fecth the data from using db, just update the URL for parent component to fetch data accordingly.
// component/features/events-filters.tsx

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export const EventFilters = () => {
  const router = useRouter();
  const pathname = usePathname(); // get the current URL
  const searchParams = useSearchParams(); // get params in the URL (query string)

  // Get selected categories from URL
  const selectedCategories =
    searchParams.get("category")?.split(",").filter(Boolean) || [];

  const handleCategoryToggle = (category: string) => {
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    let categories =
      searchParams.get("category")?.split(",").filter(Boolean) || [];

    if (categories.includes(category)) {
      // Remove category
      categories = categories.filter((c) => c !== category);
    } else {
      // Add category
      categories.push(category);
    }

    if (categories.length > 0) {
      currentParams.set("category", categories.join(","));
    } else {
      currentParams.delete("category");
    }

    router.push(`${pathname}?${currentParams.toString()}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );

    if (value) {
      currentParams.set(name, value);
    } else {
      currentParams.delete(name); // Delete filter if user choose "Tất cả"
    }

    // Update the URL
    router.push(`${pathname}?${currentParams.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );

    if (value) {
      currentParams.set("search", value);
    } else {
      currentParams.delete("search");
    }

    router.push(`${pathname}?${currentParams.toString()}`);
  };

  const handleRemoveFilter = (filterName: string) => {
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    currentParams.delete(filterName);
    router.push(`${pathname}?${currentParams.toString()}`);
  };

  const hasActiveFilters =
    searchParams.get("category") ||
    searchParams.get("sortBy") ||
    searchParams.get("search");

  return (
    <div className="card bg-base-100 shadow-lg mb-8 border border-base-300">
      <div className="card-body">
        {/* Search bar row */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="form-control flex-1">
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
                defaultValue={searchParams.get("search") || ""}
                onChange={handleSearchChange}
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="form-control w-full md:w-64">
            <select
              id="sortBy"
              name="sortBy"
              onChange={handleFilterChange}
              value={searchParams.get("sortBy") || "startDateTime"}
              className="select select-bordered w-full"
            >
              <option value="startDateTime">📅 Ngày bắt đầu</option>
              <option value="title">🔤 Tên (A-Z)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="form-control flex-none">
              <button
                onClick={handleClearFilters}
                className="btn btn-ghost btn-outline gap-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Category filter row */}
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
                <label
                  key={category.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${selectedCategories.includes(category.value)
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
                  <img
                    src={category.icon}
                    alt={category.label}
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-sm font-medium">{category.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-base-content/60">
              Bộ lọc đang áp dụng:
            </span>
            {searchParams.get("search") && (
              <div className="badge badge-info gap-2">
                🔍 "{searchParams.get("search")}"
                <button
                  onClick={() => handleRemoveFilter("search")}
                  className="hover:text-error"
                >
                  ×
                </button>
              </div>
            )}
            {searchParams.get("category") && (
              <div className="badge badge-primary gap-2">
                {searchParams.get("category") === "ENVIRONMENT" && (
                  <>
                    <img
                      src="/images/environment.png"
                      alt=""
                      className="w-4 h-4"
                    />{" "}
                    Môi trường
                  </>
                )}
                {searchParams.get("category") === "EDUCATION" && (
                  <>
                    <img
                      src="/images/education.png"
                      alt=""
                      className="w-4 h-4"
                    />{" "}
                    Giáo dục
                  </>
                )}
                {searchParams.get("category") === "HEALTHCARE" && (
                  <>
                    <img src="/images/health.png" alt="" className="w-4 h-4" />{" "}
                    Y tế
                  </>
                )}
                {searchParams.get("category") === "COMMUNITY" && (
                  <>
                    <img
                      src="/images/community.png"
                      alt=""
                      className="w-4 h-4"
                    />{" "}
                    Cộng đồng
                  </>
                )}
              </div>
            )}
            {searchParams.get("sortBy") &&
              searchParams.get("sortBy") !== "startDateTime" && (
                <div className="badge badge-secondary gap-2">
                  Sắp xếp:{" "}
                  {searchParams.get("sortBy") === "title"
                    ? "Tên (A-Z)"
                    : "Ngày"}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
