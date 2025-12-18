// Client component with actions for a single registration (e.g., mark complete, reject).
// components/features/registration-actions.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Registration, RegistrationStatus, User } from "@prisma/client";
import { Eye } from "lucide-react";
import { ViewAnswersModal } from "./view-answers-modal";

type RegistrationAnswer = {
  id: string;
  answer: string;
  question: {
    question: string;
  };
};

type Props = {
  registration: Registration & { user: User };
};

export const RegistrationActions = ({ registration }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState<RegistrationAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const handleUpdateStatus = (status: RegistrationStatus) => {
    startTransition(async () => {
      try {
        await axios.patch(`/api/registrations/${registration.id}`, { status });
        toast.success("Cập nhật trạng thái thành công!");
        router.refresh();
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data || "Có lỗi xảy ra.");
        } else {
          toast.error("Có lỗi không mong muốn xảy ra.");
          console.error(error);
        }
      }
    });
  };

  const handleViewAnswers = async () => {
    setLoadingAnswers(true);
    try {
      const response = await axios.get(
        `/api/registrations/${registration.id}/answers`
      );
      setAnswers(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load answers:", error);
      toast.error("Không thể tải câu trả lời");
    } finally {
      setLoadingAnswers(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleViewAnswers}
          disabled={loadingAnswers}
          className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1"
          title="Xem câu trả lời"
        >
          <Eye className="h-3 w-3" />
          {loadingAnswers ? "Đang tải..." : "Xem"}
        </button>

        {registration.status === RegistrationStatus.PENDING && (
          <>
            <button
              onClick={() => handleUpdateStatus(RegistrationStatus.APPROVED)}
              disabled={isPending}
              className="text-green-600 hover:text-green-900 text-xs"
            >
              Duyệt
            </button>
            <button
              onClick={() => handleUpdateStatus(RegistrationStatus.REJECTED)}
              disabled={isPending}
              className="text-red-600 hover:text-red-900 text-xs"
            >
              Từ chối
            </button>
          </>
        )}

        {/* The 2 buttons down here just show when manager approved the register */}
        {registration.status === RegistrationStatus.APPROVED && (
          <button
            onClick={() => handleUpdateStatus(RegistrationStatus.COMPLETED)}
            disabled={isPending}
            className="text-blue-600 hover:text-blue-900 text-xs"
          >
            Đánh dấu hoàn thành
          </button>
        )}

        {registration.status === RegistrationStatus.COMPLETED && (
          <button
            onClick={() => handleUpdateStatus(RegistrationStatus.APPROVED)}
            disabled={isPending}
            className="text-base-content/70 hover:text-base-content text-xs"
          >
            Hủy hoàn thành
          </button>
        )}
      </div>

      {/* Answers Modal */}
      {showModal && (
        <ViewAnswersModal
          answers={answers}
          userName={
            registration.user.name || registration.user.email || "Người dùng"
          }
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
