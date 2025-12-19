// Client component for inviting users to an event
// components/features/invite-event-button.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { EventInviteModal } from "./event-invite-modal";

interface InviteEventButtonProps {
  eventId: string;
}

export const InviteEventButton = ({ eventId }: InviteEventButtonProps) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteClick = async () => {
    try {
      // Check if user can invite by making a test request
      await axios.get(`/api/events/${eventId}/invite?search=`);
      // If successful, open modal
      setIsInviteModalOpen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          toast.error("Bạn phải đăng ký sự kiện trước khi mời người khác");
        } else {
          toast.error(
            error.response?.data || "Không thể mở danh sách mời người dùng"
          );
        }
      } else {
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  return (
    <>
      <button
        onClick={handleInviteClick}
        className="btn btn-outline btn-secondary w-full gap-2"
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
        Mời bạn bè
      </button>

      {/* Invite Modal */}
      <EventInviteModal
        eventId={eventId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  );
};
