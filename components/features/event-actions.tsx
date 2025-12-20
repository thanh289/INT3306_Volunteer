// Component for event actions (Cancel, Restore, Delete) in management page
// components/features/event-actions.tsx

"use client";

import { useRouter } from "next/navigation";
import { Event } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";

type Props = {
  event: Event & {
    isCancelled?: boolean;
    cancelReason?: string | null;
  };
  isAdmin: boolean;
  isCreator: boolean;
  canManage: boolean;
};

export const EventActions = ({
  event,
  isAdmin,
  isCreator,
  canManage,
}: Props) => {
  const router = useRouter();

  // Check if event is currently ongoing
  const now = new Date();
  const isOngoing =
    now >= new Date(event.startDateTime) && now <= new Date(event.endDateTime);

  const handleCancel = async () => {
    const reason = window.prompt("Vui lòng nhập lý do hủy sự kiện (tùy chọn):");

    // User clicked cancel on prompt
    if (reason === null) return;

    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy sự kiện này không? Người đã đăng ký sẽ nhận được thông báo. (Bạn có thể hoàn tác sau)"
      )
    ) {
      try {
        await axios.post(`/api/events/${event.id}/cancel`, {
          reason: reason.trim() || undefined,
        });
        toast.success("Hủy sự kiện thành công!");
        router.refresh();
      } catch (error: any) {
        const errorMessage = error.response?.data || "Hủy sự kiện thất bại.";
        toast.error(errorMessage);
        console.error(error);
      }
    }
  };

  const handleRestore = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn khôi phục sự kiện này không? Người đã đăng ký sẽ nhận được thông báo."
      )
    ) {
      try {
        await axios.post(`/api/events/${event.id}/restore`);
        toast.success("Khôi phục sự kiện thành công!");
        router.refresh();
      } catch (error: any) {
        const errorMessage =
          error.response?.data || "Khôi phục sự kiện thất bại.";
        toast.error(errorMessage);
        console.error(error);
      }
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn sự kiện này không? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan."
      )
    ) {
      try {
        await axios.delete(`/api/events/${event.id}`);
        toast.success("Xóa sự kiện thành công!");
        router.push("/created-events");
        router.refresh();
      } catch (error: any) {
        const errorMessage = error.response?.data || "Xóa sự kiện thất bại.";
        toast.error(errorMessage);
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-base-100 text-base-content p-6 rounded-2xl shadow-md border-2 border-error">
      <h2 className="text-xl font-bold mb-4 text-error">Hành động nguy hiểm</h2>

      {event.isCancelled && (
        <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg">
          <p className="font-semibold text-error mb-1">Sự kiện đã bị hủy</p>
          {event.cancelReason && (
            <p className="text-sm text-error/80">Lý do: {event.cancelReason}</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {/* Cancel/Restore button */}
        {canManage && (
          <div className="flex items-start gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
            <div className="flex-1">
              {event.isCancelled ? (
                <>
                  <h3 className="font-semibold mb-1">Khôi phục sự kiện</h3>
                  <p className="text-sm text-base-content/70">
                    Khôi phục sự kiện đã bị hủy. Người đã đăng ký sẽ nhận được
                    thông báo.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold mb-1">Hủy sự kiện</h3>
                  <p className="text-sm text-base-content/70">
                    Hủy tạm thời sự kiện này. Bạn có thể hoàn tác sau. Người
                    đăng ký sẽ nhận thông báo.
                  </p>
                  {isOngoing && (
                    <p className="text-sm text-warning mt-1">
                      Không thể hủy sự kiện đang diễn ra
                    </p>
                  )}
                </>
              )}
            </div>
            {event.isCancelled ? (
              <button
                onClick={handleRestore}
                className="btn btn-success gap-2 shrink-0"
              >
                Khôi phục
              </button>
            ) : (
              <button
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgb(239, 68, 68)";
                  e.currentTarget.style.borderColor = "rgb(239, 68, 68)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.color = "";
                }}
                className="btn btn-outline gap-2 shrink-0 border-warning text-warning"
                disabled={isOngoing}
              >
                Hủy sự kiện
              </button>
            )}
          </div>
        )}

        {/* Delete button - only for admin and creator */}
        {(isCreator || isAdmin) && (
          <div className="flex items-start gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-error">
                Xóa vĩnh viễn sự kiện
              </h3>
              <p className="text-sm text-base-content/70">
                Xóa hoàn toàn sự kiện và tất cả dữ liệu liên quan. Hành động này
                không thể hoàn tác.
              </p>
            </div>
            <button
              onClick={handleDelete}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgb(239, 68, 68)";
                e.currentTarget.style.borderColor = "rgb(239, 68, 68)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.color = "";
              }}
              className="btn btn-outline gap-2 shrink-0 border-error text-error"
            >
              Xóa vĩnh viễn
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
