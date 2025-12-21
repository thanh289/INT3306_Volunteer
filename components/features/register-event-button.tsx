// src/components/features/register-event-button.tsx
// components/features/register-event-button.tsx

"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Role } from "@prisma/client";
import { RegistrationModal } from "./registration-modal";

type Question = {
  id: string;
  question: string;
  isRequired: boolean;
};

type RegisterEventButtonProps = {
  eventId: string;
  isInitiallyRegistered: boolean;
  registrationStatus?: string | null;
  isEventEnded: boolean;
  isEventStarted: boolean;
  isCancelled?: boolean;
  cancelReason?: string | null;
  requiresRegistrationForm?: boolean;
};

export const RegisterEventButton = ({
  eventId,
  isInitiallyRegistered,
  registrationStatus,
  isEventEnded,
  isEventStarted,
  isCancelled,
  cancelReason,
  requiresRegistrationForm = false,
}: RegisterEventButtonProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // registered if status: not REJECTED
  const [isRegistered, setIsRegistered] = useState(
    isInitiallyRegistered && registrationStatus !== "REJECTED"
  );
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Fetch registration questions when user wants to register
  useEffect(() => {
    if (showModal && !isRegistered) {
      setLoadingQuestions(true);
      axios
        .get(`/api/events/${eventId}/registration-questions`)
        .then((res) => setQuestions(res.data))
        .catch((err) => {
          console.error("Failed to load questions:", err);
          setQuestions([]);
        })
        .finally(() => setLoadingQuestions(false));
    } else if (!showModal) {
      setLoadingQuestions(false);
    }
  }, [showModal, isRegistered, eventId]);

  if (session?.user?.role === Role.ADMIN) {
    return null;
  }

  const handleClick = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (isRegistered) {
      // Unregister
      startTransition(async () => {
        try {
          await axios.delete(`/api/events/${eventId}/register`);
          toast.success("Hủy đăng ký thành công!");
          setIsRegistered(false);
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
    } else {
      // Register based on whether form is required
      if (requiresRegistrationForm) {
        setLoadingQuestions(true);
        setShowModal(true);
      } else {
        // Direct registration without form
        startTransition(async () => {
          try {
            await axios.post(`/api/events/${eventId}/register`, {
              answers: [],
            });
            toast.success("Đã gửi yêu cầu đăng ký đến quản lý sự kiện!");
            setIsRegistered(true);
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
      }
    }
  };

  const handleRegistrationSuccess = () => {
    setShowModal(false);
    setIsRegistered(true);
    router.refresh();
  };

  if (status !== "authenticated") {
    return (
      <button
        onClick={handleClick}
        className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm cursor-pointer"
      >
        Đăng nhập để đăng ký
      </button>
    );
  }

  if (isCancelled) {
    return (
      <div className="w-full md:w-auto">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Sự kiện đã bị hủy</h3>
            {cancelReason && <div className="text-sm">{cancelReason}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (isEventEnded) {
    return (
      <button
        disabled
        className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm cursor-not-allowed"
      >
        Sự kiện đã kết thúc
      </button>
    );
  }

  if (isEventStarted && !isRegistered) {
    return (
      <button disabled className="btn btn-disabled w-full">
        Sự kiện đã bắt đầu
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`btn w-full gap-2 text-white ${
          isRegistered
            ? "bg-red-600 hover:bg-red-700 border-red-600"
            : "bg-green-600 hover:bg-green-700 border-green-600"
        }`}
      >
        {isPending
          ? "Đang xử lý..."
          : isRegistered
          ? "Hủy đăng ký"
          : "Đăng ký tham gia sự kiện này"}
      </button>

      {/* Registration Modal */}
      {showModal && (
        <>
          {loadingQuestions ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : (
            <RegistrationModal
              eventId={eventId}
              questions={questions}
              onClose={() => setShowModal(false)}
              onSuccess={handleRegistrationSuccess}
            />
          )}
        </>
      )}
    </>
  );
};
