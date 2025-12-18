// English: A client component form for editing an existing event.
// components/features/edit-event-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Event, EventCategory } from "@prisma/client";
import { EventImageUpload } from "./event-image-upload";

// Category configuration with icons and colors
const categoryConfig = {
  ENVIRONMENT: {
    label: "Môi trường",
    icon: "/images/environment.png",
    color: "text-green-600",
  },
  EDUCATION: {
    label: "Giáo dục",
    icon: "/images/education.png",
    color: "text-blue-600",
  },
  HEALTHCARE: {
    label: "Y tế",
    icon: "/images/health.png",
    color: "text-red-600",
  },
  COMMUNITY: {
    label: "Cộng đồng",
    icon: "/images/community.png",
    color: "text-purple-600",
  },
};

// date format
const formatDateForInput = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export const EditEventForm = ({ event }: { event: Event }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    startDateTime: formatDateForInput(event.startDateTime),
    endDateTime: formatDateForInput(event.endDateTime),
    maxAttendees: event.maxAttendees.toString(),
    category: event.category,
  });

  // Check if we should show image upload section (from query param)
  useEffect(() => {
    if (searchParams.get("uploadImage") === "true") {
      setShowImageUpload(true);
      // Remove the query param
      router.replace(`/events/${event.id}/edit`);
    }
  }, [searchParams, event.id, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.put(`/api/events/${event.id}`, formData);
      toast.success("Cập nhật sự kiện thành công!");
      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Cập nhật sự kiện thất bại.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Image Upload Section */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowImageUpload(!showImageUpload)}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Ảnh sự kiện
            </h3>
            <button type="button" className="btn btn-ghost btn-sm btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${
                  showImageUpload ? "rotate-180" : ""
                }`}
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
            </button>
          </div>

          {showImageUpload && (
            <div className="mt-4">
              <EventImageUpload
                eventId={event.id}
                currentImageUrl={event.imageUrl}
                eventTitle={event.title}
              />
            </div>
          )}
        </div>
      </div>

      {/* Event Details Form */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Thông tin sự kiện
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="form-control">
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
                  Tiêu đề sự kiện
                </span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="Nhập tiêu đề sự kiện"
                value={formData.title}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Category - Visual Radio Cards */}
            <div className="form-control">
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
                </span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <label
                    key={key}
                    className={`card border-2 cursor-pointer transition-all hover:shadow-md ${
                      formData.category === key
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-base-300 hover:border-primary/50"
                    }`}
                  >
                    <div className="card-body p-4 items-center text-center">
                      <input
                        type="radio"
                        name="category"
                        value={key}
                        checked={formData.category === key}
                        onChange={handleChange}
                        className="radio radio-primary radio-sm"
                      />
                      <img
                        src={config.icon}
                        alt={config.label}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="text-sm font-medium">
                        {key === "ENVIRONMENT" && "Môi trường"}
                        {key === "EDUCATION" && "Giáo dục"}
                        {key === "HEALTHCARE" && "Y tế"}
                        {key === "COMMUNITY" && "Cộng đồng"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-control">
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
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Mô tả chi tiết
                </span>
              </label>
              <textarea
                name="description"
                id="description"
                required
                placeholder="Mô tả về sự kiện, mục đích, hoạt động..."
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="textarea textarea-bordered w-full"
              />
            </div>

            {/* Location */}
            <div className="form-control">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Địa điểm
                </span>
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                placeholder="Địa chỉ cụ thể nơi diễn ra sự kiện"
                value={formData.location}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Date Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success"
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
                    Bắt đầu
                  </span>
                </label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  id="startDateTime"
                  required
                  value={formData.startDateTime}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-error"
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
                    Kết thúc
                  </span>
                </label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  id="endDateTime"
                  required
                  value={formData.endDateTime}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Max Attendees */}
            <div className="form-control">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Số người tham gia tối đa
                </span>
              </label>
              <input
                type="number"
                name="maxAttendees"
                id="maxAttendees"
                required
                min="1"
                placeholder="Số lượng tình nguyện viên cần"
                value={formData.maxAttendees}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
