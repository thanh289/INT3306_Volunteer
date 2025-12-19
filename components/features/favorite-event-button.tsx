// Component for favoriting/unfavoriting an event
// components/features/favorite-event-button.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

type FavoriteEventButtonProps = {
  eventId: string;
  compact?: boolean; // For smaller button in event cards
};

export const FavoriteEventButton = ({
  eventId,
  compact = false,
}: FavoriteEventButtonProps) => {
  const { status } = useSession();

  const [isInterested, setIsInterested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already interested in this event
  useEffect(() => {
    const checkInterested = async () => {
      if (status === "authenticated") {
        try {
          const response = await axios.get(
            `/api/interested-events/check?eventId=${eventId}`
          );
          setIsInterested(response.data.isInterested);
        } catch (error) {
          console.error("Error checking interested status:", error);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkInterested();
  }, [eventId, status]);

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent event propagation and default link behavior
    e.stopPropagation();
    e.preventDefault();

    if (status === "unauthenticated") {
      toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
      return;
    }

    setIsLoading(true);

    try {
      if (isInterested) {
        await axios.delete(`/api/interested-events?eventId=${eventId}`);
        setIsInterested(false);
        toast.success("Đã xóa khỏi danh sách quan tâm!");
      } else {
        await axios.post("/api/interested-events", { eventId });
        setIsInterested(true);
        toast.success("Đã thêm vào danh sách quan tâm!");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data || "Có lỗi xảy ra.");
      } else {
        toast.error("Có lỗi không mong muốn xảy ra.");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    // Compact version for event cards
    return (
      <button
        onClick={handleClick}
        disabled={isLoading || isChecking}
        className="p-2 transition-all duration-200 disabled:opacity-50 group"
        title={
          isInterested
            ? "Xóa khỏi danh sách quan tâm"
            : "Thêm vào danh sách quan tâm"
        }
      >
        <Heart
          className={`w-6 h-6 transition-transform duration-200 group-hover:scale-125 ${
            isInterested
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500"
          }`}
        />
      </button>
    );
  }

  // Full button version for event detail page
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isChecking}
      className={`flex items-center gap-2 px-6 py-3 font-medium border rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 group ${
        isInterested
          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
          isInterested ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
      {isLoading ? "Đang xử lý..." : isInterested ? "Đã quan tâm" : "Quan tâm"}
    </button>
  );
};
