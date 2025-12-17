// A client component form for creating a new event.
// components/features/create-event-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { EventCategory } from "@prisma/client";
import Image from "next/image";

const categoryConfig = {
  ENVIRONMENT: { icon: "🌱", label: "Môi trường", color: "text-success" },
  EDUCATION: { icon: "📚", label: "Giáo dục", color: "text-info" },
  HEALTHCARE: { icon: "⚕️", label: "Y tế - Sức khỏe", color: "text-error" },
  COMMUNITY: { icon: "🤝", label: "Cộng đồng", color: "text-warning" },
};

export const CreateEventForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    maxAttendees: "50",
    category: EventCategory.COMMUNITY,
    requirePostApproval: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const response = await axios.post("/api/events", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const newEvent = response.data;
      toast.success("Tạo sự kiện thành công!");

      router.push(`/events/${newEvent.id}`);
      router.refresh();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach(
            (detail: { field: string; message: string }) => {
              toast.error(`${detail.field}: ${detail.message}`);
            }
          );
        } else if (typeof errorData === "string") {
          toast.error(errorData);
        } else {
          toast.error("Tạo sự kiện thất bại. Vui lòng kiểm tra lại thông tin.");
        }

        // Keep console for debugging
        console.error("Validation errors:", errorData);
      } else {
        toast.error("Đã có lỗi không mong muốn xảy ra.");
        console.error("Error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
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
          value={formData.title}
          onChange={handleChange}
          placeholder="VD: Chiến dịch trồng cây xanh"
          className="input input-bordered w-full focus:input-primary"
        />
      </div>

      {/* Category */}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categoryConfig).map(([value, config]) => (
            <label
              key={value}
              className={`cursor-pointer card card-compact border-2 transition-all hover:shadow-lg ${
                formData.category === value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-base-300 hover:border-primary/50"
              }`}
            >
              <div className="card-body items-center text-center">
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={formData.category === value}
                  onChange={handleChange}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-3xl">{config.icon}</span>
                <span className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Image Upload */}
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Ảnh sự kiện
            <span className="badge badge-ghost badge-sm">Tùy chọn</span>
          </span>
        </label>
        {imagePreview ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-base-300">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary hover:bg-base-200/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-base-content/40 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-base-content/70">
                <span className="font-semibold">Nhấn để tải ảnh lên</span> hoặc
                kéo thả
              </p>
              <p className="text-xs text-base-content/50">
                PNG, JPG (tối đa 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        )}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Mô tả chi tiết
          </span>
        </label>
        <textarea
          name="description"
          id="description"
          required
          value={formData.description}
          onChange={handleChange}
          rows={5}
          placeholder="Mô tả chi tiết về sự kiện, mục đích, hoạt động..."
          className="textarea textarea-bordered w-full focus:textarea-primary"
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
          value={formData.location}
          onChange={handleChange}
          placeholder="VD: Công viên Cầu Giấy, Hà Nội"
          className="input input-bordered w-full focus:input-primary"
        />
      </div>

      {/* Date Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="input input-bordered w-full focus:input-primary"
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
            className="input input-bordered w-full focus:input-primary"
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
            Số người tối đa
          </span>
        </label>
        <input
          type="number"
          name="maxAttendees"
          id="maxAttendees"
          required
          min="1"
          value={formData.maxAttendees}
          onChange={handleChange}
          className="input input-bordered w-full focus:input-primary"
        />
      </div>

      {/* Post Approval Checkbox */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            name="requirePostApproval"
            checked={formData.requirePostApproval}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                requirePostApproval: e.target.checked,
              }))
            }
            className="checkbox checkbox-primary"
          />
          <span className="label-text">
            <span className="font-semibold">Yêu cầu duyệt bài đăng</span>
            <span className="block text-sm text-base-content/60 mt-1">
              Bài đăng của tình nguyện viên sẽ cần được admin hoặc người quản lý
              duyệt trước khi hiển thị công khai
            </span>
          </span>
        </label>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Sau khi tạo sự kiện, bạn có thể thêm ảnh và chỉnh sửa thông tin.
        </span>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Đang tạo sự kiện...
            </>
          ) : (
            <>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tạo sự kiện
            </>
          )}
        </button>
      </div>
    </form>
  );
};
