// Modal to view registration answers for managers
// components/features/view-answers-modal.tsx

"use client";

import { X } from "lucide-react";

type Answer = {
  id: string;
  answer: string;
  question: {
    question: string;
  };
};

type Props = {
  answers: Answer[];
  userName: string;
  onClose: () => void;
};

export const ViewAnswersModal = ({ answers, userName, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-base-100 z-10">
          <div>
            <h2 className="text-2xl font-bold">Câu trả lời đăng ký</h2>
            <p className="text-base-content/70 mt-1">
              Người đăng ký: <span className="font-semibold">{userName}</span>
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {answers.length > 0 ? (
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div key={answer.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary text-lg">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-base mb-2">
                        {answer.question.question}
                      </p>
                      <div className="bg-base-200 rounded-lg p-4">
                        <p className="text-base-content/80 whitespace-pre-wrap break-words">
                          {answer.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < answers.length - 1 && (
                    <div className="divider"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-base-content/30 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-base-content/60 text-lg">
                Không có câu trả lời
              </p>
              <p className="text-base-content/40 text-sm mt-2">
                Người dùng đã đăng ký khi sự kiện chưa có câu hỏi
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-base-100 sticky bottom-0">
          <button onClick={onClose} className="btn btn-primary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
