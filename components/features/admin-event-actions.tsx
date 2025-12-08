// English: Client component for Admin actions on an event (Approve, Reject).
// components/features/admin-event-actions.tsx

"use client";

import { useTransition } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { EventStatus } from "@prisma/client";

export const AdminEventActions = ({
  eventId,
  onSuccess,
}: {
  eventId: string;
  onSuccess?: () => void;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (status: EventStatus) => {
    startTransition(async () => {
      try {
        await axios.put(`/api/events/${eventId}`, { status });
        toast.success(
          `Sự kiện đã được ${status === "PUBLISHED" ? "duyệt" : "từ chối"}.`
        );
        // Revalidate data immediately without full page refresh
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.error || error.message || "Có lỗi xảy ra";
        toast.error(`Cập nhật thất bại: ${errorMsg}`);
        console.error("Admin action error:", error.response?.data || error);
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => handleUpdateStatus(EventStatus.PUBLISHED)}
        disabled={isPending}
        className="btn bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
      >
        {isPending ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        Duyệt
      </button>
      <button
        onClick={() => handleUpdateStatus(EventStatus.REJECTED)}
        disabled={isPending}
        className="btn bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
      >
        {isPending ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
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
        )}
        Từ chối
      </button>
    </div>
  );
};
