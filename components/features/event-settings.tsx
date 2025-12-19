// Component for managing event settings (registration form and post approval)
// components/features/event-settings.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Event } from "@prisma/client";

type Props = {
  event: Event;
};

export const EventSettings = ({ event }: Props) => {
  const router = useRouter();
  const [requiresRegistrationForm, setRequiresRegistrationForm] = useState(
    event.requiresRegistrationForm
  );
  const [requirePostApproval, setRequirePostApproval] = useState(
    event.requirePostApproval
  );
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const handleToggleRegistrationForm = async () => {
    const newValue = !requiresRegistrationForm;
    setIsSavingForm(true);

    try {
      await axios.patch(`/api/events/${event.id}`, {
        requiresRegistrationForm: newValue,
      });
      setRequiresRegistrationForm(newValue);
      toast.success(
        newValue ? "Đã bật yêu cầu form đăng ký" : "Đã tắt yêu cầu form đăng ký"
      );
      router.refresh();
    } catch (error) {
      toast.error("Không thể cập nhật cài đặt");
      console.error(error);
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleTogglePostApproval = async () => {
    const newValue = !requirePostApproval;
    setIsSavingPost(true);

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
      setIsSavingPost(false);
    }
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-md border border-base-300">
      <div className="p-6 border-b border-base-300">
        <h2 className="text-xl font-bold text-base-content">Cài đặt sự kiện</h2>
        <p className="text-sm text-base-content/60 mt-1">
          Quản lý form đăng ký và yêu cầu duyệt bài đăng
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Registration Form Setting */}
        <div className="flex items-start justify-between p-5 border-2 border-base-300 rounded-xl bg-base-100">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-base-content text-lg mb-2">
              Câu hỏi đăng ký
            </h3>
            <p className="text-sm text-base-content/70">
              Khi bật, người đăng ký sẽ phải trả lời các câu hỏi mà bạn đặt ra.
              Form đăng ký giúp bạn tìm hiểu thêm về người tham gia.
            </p>
            {requiresRegistrationForm && (
              <p className="text-xs text-info mt-2 flex items-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
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
                  Người dùng có thể đăng ký mà không cần trả lời câu hỏi nếu bạn
                  chưa tạo câu hỏi nào
                </span>
              </p>
            )}
          </div>
          <div className="shrink-0 bg-base-200 p-5 rounded-xl border-2 border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={requiresRegistrationForm}
                onChange={handleToggleRegistrationForm}
                disabled={isSavingForm}
                className="checkbox checkbox-success checkbox-lg scale-150"
              />
            </label>
          </div>
        </div>

        {/* Post Approval Setting */}
        <div className="flex items-start justify-between p-5 border-2 border-base-300 rounded-xl bg-base-100">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-base-content text-lg mb-2">
              Yêu cầu duyệt bài đăng
            </h3>
            <p className="text-sm text-base-content/70">
              Khi bật, bài đăng của tình nguyện viên sẽ cần được admin hoặc
              người quản lý duyệt trước khi hiển thị công khai trên kênh trao
              đổi.
            </p>
            {requirePostApproval && (
              <p className="text-xs text-info mt-2 flex items-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
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
                  Bài đăng của admin và người quản lý sự kiện sẽ tự động được
                  duyệt
                </span>
              </p>
            )}
          </div>
          <div className="shrink-0 bg-base-200 p-5 rounded-xl border-2 border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={requirePostApproval}
                onChange={handleTogglePostApproval}
                disabled={isSavingPost}
                className="checkbox checkbox-success checkbox-lg scale-150"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
