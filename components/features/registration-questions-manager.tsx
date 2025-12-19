// Component for managing registration questions
// components/features/registration-questions-manager.tsx

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

type Question = {
  id: string;
  question: string;
  isRequired: boolean;
  order: number;
};

type Props = {
  eventId: string;
  initialEnabled: boolean;
};

export const RegistrationQuestionsManager = ({
  eventId,
  initialEnabled,
}: Props) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRequired, setEditRequired] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [newRequired, setNewRequired] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `/api/events/${eventId}/registration-questions`
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newQuestion.trim()) {
      toast.error("Vui lòng nhập câu hỏi");
      return;
    }

    try {
      await axios.post(`/api/events/${eventId}/registration-questions`, {
        question: newQuestion,
        isRequired: newRequired,
        order: questions.length,
      });

      toast.success("Đã thêm câu hỏi");
      setNewQuestion("");
      setNewRequired(true);
      setIsAdding(false);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.response?.data || "Không thể thêm câu hỏi");
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.question);
    setEditRequired(question.isRequired);
  };

  const handleSave = async (id: string) => {
    if (!editText.trim()) {
      toast.error("Vui lòng nhập câu hỏi");
      return;
    }

    try {
      await axios.patch(`/api/events/${eventId}/registration-questions/${id}`, {
        question: editText,
        isRequired: editRequired,
      });

      toast.success("Đã cập nhật câu hỏi");
      setEditingId(null);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.response?.data || "Không thể cập nhật câu hỏi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;

    try {
      await axios.delete(`/api/events/${eventId}/registration-questions/${id}`);
      toast.success("Đã xóa câu hỏi");
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.response?.data || "Không thể xóa câu hỏi");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText("");
    setEditRequired(true);
  };

  const handleToggleEnabled = async () => {
    try {
      await axios.patch(`/api/events/${eventId}`, {
        requiresRegistrationForm: !isEnabled,
      });
      setIsEnabled(!isEnabled);
      toast.success(
        !isEnabled
          ? "Đã bật yêu cầu form đăng ký"
          : "Đã tắt yêu cầu form đăng ký"
      );
    } catch (error: any) {
      toast.error(error.response?.data || "Không thể cập nhật cài đặt");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="card-title flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Câu hỏi đăng ký
            </h2>
            <p className="text-sm text-base-content/60">
              Quản lý các câu hỏi mà người đăng ký cần trả lời
            </p>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isEnabled}
                onChange={handleToggleEnabled}
              />
            </label>
          </div>
        </div>

        <div className="divider"></div>

        {!isEnabled && (
          <div className="alert alert-warning">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Form đăng ký đang tắt. Người dùng có thể đăng ký mà không cần trả
              lời câu hỏi.
            </span>
          </div>
        )}

        {isEnabled && (
          <>
            {/* Questions List */}
            <div className="space-y-3">
              {questions.length === 0 && !isAdding && (
                <div className="text-center py-8 text-base-content/60">
                  Chưa có câu hỏi nào. Thêm câu hỏi để tìm hiểu thêm về người
                  đăng ký.
                </div>
              )}

              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 border border-base-300 rounded-lg space-y-2"
                >
                  {editingId === q.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-semibold text-base-content/70 mt-3">
                          {index + 1}.
                        </span>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="textarea textarea-bordered flex-1 px-4 py-3"
                          rows={2}
                          autoFocus
                        />
                      </div>
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          checked={editRequired}
                          onChange={(e) => setEditRequired(e.target.checked)}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                        <span className="label-text">Bắt buộc trả lời</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(q.id)}
                          className="btn btn-primary btn-md gap-1"
                        >
                          <Save className="h-4 w-4" />
                          Lưu
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn btn-outline btn-secondary btn-md gap-1"
                        >
                          <X className="h-4 w-4" />
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-base-content/70">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="font-medium">{q.question}</p>
                            {q.isRequired && (
                              <span className="badge badge-primary px-3 py-1 text-xs mt-1">
                                Bắt buộc
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(q)}
                          className="btn btn-outline btn-primary btn-sm gap-1"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="btn btn-outline btn-error btn-sm gap-1"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Question Form */}
              {isAdding && (
                <div className="p-4 border-2 border-dashed border-primary rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-base-content/70 mt-3">
                      {questions.length + 1}.
                    </span>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Nhập câu hỏi..."
                      className="textarea textarea-bordered flex-1 px-4 py-3"
                      rows={2}
                      autoFocus
                    />
                  </div>
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={newRequired}
                      onChange={(e) => setNewRequired(e.target.checked)}
                      className="checkbox checkbox-sm checkbox-primary"
                    />
                    <span className="label-text">Bắt buộc trả lời</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      className="btn btn-primary btn-md gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewQuestion("");
                        setNewRequired(true);
                      }}
                      className="btn btn-outline btn-secondary btn-md gap-1"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Button */}
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="btn btn-outline btn-primary btn-md gap-2 mt-4"
              >
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
