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
  initialIsInterested?: boolean; // Pre-fetched interested status
};

export const FavoriteEventButton = ({
  eventId,
  compact = false,
  initialIsInterested,
}: FavoriteEventButtonProps) => {
  const { status } = useSession();

  const [isInterested, setIsInterested] = useState(
    initialIsInterested ?? false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(
    initialIsInterested === undefined
  );

  // Only check via API if initialIsInterested was not provided
  useEffect(() => {
    if (initialIsInterested !== undefined) {
      // Already have the data, no need to fetch
      setIsChecking(false);
      return;
    }

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
  }, [eventId, status, initialIsInterested]);

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
      className={`btn w-full gap-2 ${
        isInterested
          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          : "btn-outline"
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
