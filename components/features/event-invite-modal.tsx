// Component for inviting users to an event
// components/features/event-invite-modal.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  alreadyInvitedByMe: boolean;
}

interface EventInviteModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EventInviteModal = ({
  eventId,
  isOpen,
  onClose,
}: EventInviteModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/events/${eventId}/invite?search=${encodeURIComponent(
          searchQuery
        )}`
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setUsers([]);
      setSearchQuery("");
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchQuery, eventId]);

  const handleInvite = async (userId: string) => {
    setIsSending(userId);
    try {
      await axios.post(`/api/events/${eventId}/invite`, {
        invitedUserId: userId,
      });

      // Mark user as invited instead of removing from list
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, alreadyInvitedByMe: true } : u
        )
      );
      toast.success("Đã gửi lời mời thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Không thể gửi lời mời");
      } else {
        toast.error("Có lỗi xảy ra khi gửi lời mời");
      }
    } finally {
      setIsSending(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Mời người tham gia
        </h3>

        {/* Search input */}
        <div className="form-control mb-4">
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
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered pl-10"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              Người dùng đã được mời/không phải là tình nguyện viên/chưa đăng ký
              tài khoản.
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        {user.imageUrl ? (
                          <Image
                            src={
                              "/" +
                              user.imageUrl
                                .replace(/\\/g, "/")
                                .replace(/^\/+/, "")
                            }
                            alt={user.name || "User"}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full">
                            {(user.name || user.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User info */}
                    <div>
                      <div className="font-semibold">
                        {user.name || "Không có tên"}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Invite button */}
                  {user.alreadyInvitedByMe ? (
                    <button disabled className="btn btn-ghost btn-sm gap-2">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Đã mời
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInvite(user.id)}
                      disabled={isSending === user.id}
                      className="btn btn-primary btn-sm"
                    >
                      {isSending === user.id ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
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
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          Mời
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Đóng
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
