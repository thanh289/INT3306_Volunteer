// Modal for event registration with custom questions
// components/features/registration-modal.tsx

"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

type Question = {
  id: string;
  question: string;
  isRequired: boolean;
};

type RegistrationModalProps = {
  eventId: string;
  questions: Question[];
  onClose: () => void;
  onSuccess: () => void;
};

export const RegistrationModal = ({
  eventId,
  questions,
  onClose,
  onSuccess,
}: RegistrationModalProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    const missingRequired = questions
      .filter((q) => q.isRequired && !answers[q.id]?.trim())
      .map((q) => q.question);

    if (missingRequired.length > 0) {
      toast.error("Vui lòng trả lời tất cả câu hỏi bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`/api/events/${eventId}/register`, {
        answers: questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] || "",
        })),
      });

      toast.success("Đã gửi yêu cầu đăng ký đến quản lý sự kiện!");
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data || "Có lỗi xảy ra";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Đăng ký tham gia sự kiện</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {questions.length > 0 ? (
            <>
              <div className="alert alert-info">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Vui lòng trả lời các câu hỏi bên dưới để hoàn tất đăng ký
                </span>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      {index + 1}. {question.question}
                      {question.isRequired && (
                        <span className="text-error ml-1">*</span>
                      )}
                    </span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          setAnswers({ ...answers, [question.id]: value });
                        }
                      }}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="textarea textarea-bordered w-full min-h-32"
                      required={question.isRequired}
                      maxLength={500}
                    />
                    <div className="text-xs text-base-content/60 text-right mt-1">
                      {(answers[question.id] || "").length}/500 ký tự
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="alert">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Xác nhận đăng ký tham gia sự kiện</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Đang gửi...
                </>
              ) : (
                "Xác nhận đăng ký"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
