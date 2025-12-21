// Component for managing event managers and delete event
// components/features/event-manager-management.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserPlus, X } from "lucide-react";
import Image from "next/image";

interface EventManager {
  id: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
}

interface Props {
  eventId: string;
  eventTitle: string;
  creatorId: string;
}

export const EventManagerManagement = ({
  eventId,
  eventTitle: _eventTitle,
  creatorId,
}: Props) => {
  const { data: session } = useSession();
  const [managers, setManagers] = useState<EventManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Check if current user is admin, creator, or an event manager
  const isAdmin = session?.user?.role === "ADMIN";
  const isCreator = session?.user?.id === creatorId;
  const isEventManager = managers.some((m) => m.userId === session?.user?.id);
  const canManage = isAdmin || isCreator || isEventManager;

  useEffect(() => {
    fetchManagers();
  }, [eventId]);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}/managers`);
      setManagers(response.data);
    } catch (error) {
      console.error("Failed to fetch managers:", error);
      toast.error("Không thể tải danh sách quản lý");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;

    setIsAdding(true);
    try {
      const userResponse = await axios.get(
        `/api/users/search?email=${encodeURIComponent(userEmail.trim())}`
      );

      if (!userResponse.data.found || !userResponse.data.user) {
        toast.error("Không tìm thấy người dùng với email này");
        return;
      }

      const targetUser = userResponse.data.user;

      await axios.post(`/api/events/${eventId}/managers`, {
        userId: targetUser.id,
      });

      await fetchManagers();
      setUserEmail("");
      setShowAddModal(false);
      toast.success(
        `Đã thêm ${targetUser.name || targetUser.email} làm quản lý sự kiện`
      );
    } catch (error: any) {
      console.error("Failed to add manager:", error);
      const errorMessage = error.response?.data || "Không thể thêm quản lý";
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveManager = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quyền quản lý của người này?"))
      return;

    try {
      await axios.delete(`/api/events/${eventId}/managers?userId=${userId}`);
      setManagers(managers.filter((m) => m.userId !== userId));
      toast.success("Đã xóa quyền quản lý");
    } catch (error: any) {
      console.error("Failed to remove manager:", error);
      const errorMessage = error.response?.data || "Không thể xóa quản lý";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <div className="skeleton h-32 w-full"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Event Managers Section */}
      <div className="bg-base-100 rounded-2xl shadow-md border border-base-300">
        <div className="p-6 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Danh sách người quản lý sự kiện
              </h2>
            </div>
            {canManage && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-sm btn-primary gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Thêm quản lý
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {managers.length === 0 ? (
              <p className="text-base-content/60 text-center py-4">
                Chưa có quản lý nào được bổ nhiệm
              </p>
            ) : (
              managers.map((manager) => (
                <div
                  key={manager.id}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder w-10 h-10 relative rounded-full overflow-hidden">
                      {manager.user.imageUrl ? (
                        <Image
                          src={
                            "/" +
                            manager.user.imageUrl
                              .replace(/\\/g, "/")
                              .replace(/^\/+/, "")
                          }
                          alt={
                            manager.user.name || manager.user.email || "Avatar"
                          }
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary">
                          <span className="text-sm font-semibold">
                            {(manager.user.name || manager.user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {manager.user.name || manager.user.email}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {manager.userId === creatorId && "(Người tạo)"}
                      </p>
                    </div>
                  </div>

                  {canManage && manager.userId !== creatorId && (
                    <button
                      onClick={() => handleRemoveManager(manager.userId)}
                      className="btn btn-ghost btn-sm text-error"
                      title="Xóa quyền quản lý"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Thêm quản lý sự kiện</h3>
            <form onSubmit={handleAddManager}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email người dùng</span>
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Nhập email người dùng"
                  className="input input-bordered"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Người dùng phải có vai trò EVENT_MANAGER hoặc ADMIN
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setUserEmail("");
                  }}
                  className="btn"
                  disabled={isAdding}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isAdding || !userEmail.trim()}
                >
                  {isAdding ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !isAdding && setShowAddModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};
