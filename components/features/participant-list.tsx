// A client component that fetches and displays the list of event participants
// component/features/participant-list.tsx

"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Registration, User, RegistrationStatus } from "@prisma/client";
import { RegistrationActions } from "./registration-actions";
import { EventInviteModal } from "./event-invite-modal";

type Participant = Registration & { user: User };
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const ParticipantList = ({ eventId }: { eventId: string }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const {
    data: registrations,
    isLoading,
    error,
  } = useSWR<Participant[]>(
    `/api/events/${eventId}/registrations`,
    fetcher,
    { refreshInterval: 5000 } // Auto fetch after 5s
  );

  if (isLoading) return <p>Đang tải danh sách...</p>;
  if (error) return <p>Không thể tải danh sách người tham gia.</p>;

  const hasParticipants = registrations && registrations.length > 0;

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          Danh sách tình nguyện viên đã đăng ký (
          {hasParticipants ? registrations.length : 0})
        </h2>

        {/* Invite button */}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btn btn-primary btn-sm gap-2"
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
          Mời người tham gia
        </button>
      </div>

      {/* Invite Modal */}
      <EventInviteModal
        eventId={eventId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {!hasParticipants ? (
        <p className="text-center py-8 text-base-content/60">
          Chưa có ai đăng ký sự kiện này.
        </p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-base-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase">
                Họ và tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase">
                Ngày đăng ký
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-base-100 divide-y divide-base-300">
            {registrations.map((reg, index) => (
              <tr key={reg.id}>
                <td className="px-6 py-4 text-sm text-base-content/60">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-base-content">
                  {reg.user.name}
                </td>
                <td className="px-6 py-4 text-sm text-base-content/60">
                  {reg.user.email}
                </td>
                <td className="px-6 py-4 text-sm text-base-content/60">
                  {new Date(reg.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={reg.status} />
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <RegistrationActions registration={reg} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Create a small component to display the status icon
const StatusBadge = ({ status }: { status: RegistrationStatus }) => {
  const statusConfig = {
    PENDING: { text: "Chờ duyệt", style: "bg-yellow-100 text-yellow-800" },
    APPROVED: { text: "Đã duyệt", style: "bg-blue-100 text-blue-800" },
    COMPLETED: { text: "Đã hoàn thành", style: "bg-green-100 text-green-800" },
    REJECTED: { text: "Đã từ chối", style: "bg-red-100 text-red-800" },
  };
  const config = statusConfig[status];
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.style}`}
    >
      {config.text}
    </span>
  );
};
