// Component for managing post approval settings
// components/features/event-post-settings.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Event } from "@prisma/client";

type Props = {
  event: Event;
};

export const EventPostSettings = ({ event }: Props) => {
  const router = useRouter();
  const [requirePostApproval, setRequirePostApproval] = useState(
    event.requirePostApproval
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async () => {
    const newValue = !requirePostApproval;
    setIsSaving(true);

    try {
      await axios.patch(`/api/events/${event.id}/post-settings`, {
        requirePostApproval: newValue,
      });
      setRequirePostApproval(newValue);
      toast.success("Đã cập nhật cài đặt bài đăng!");
      router.refresh();
    } catch (error) {
      toast.error("Không thể cập nhật cài đặt");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cài đặt bài đăng</h2>
      <div className="space-y-4">
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              checked={requirePostApproval}
              onChange={handleToggle}
              disabled={isSaving}
              className="checkbox checkbox-primary"
            />
            <span className="label-text">
              <span className="font-semibold block">
                Yêu cầu duyệt bài đăng
              </span>
              <span className="text-sm text-base-content/60 block mt-1">
                Khi bật, bài đăng của tình nguyện viên sẽ cần được admin hoặc
                người quản lý duyệt trước khi hiển thị công khai trên kênh trao
                đổi
              </span>
            </span>
          </label>
        </div>

        {requirePostApproval && (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 flex-shrink-0"
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
              Bài đăng của admin và người quản lý sự kiện sẽ tự động được duyệt
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
