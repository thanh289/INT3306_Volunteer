// Component for displaying and adding comments to a post
// components/features/post-comments.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { Role, RegistrationStatus } from "@prisma/client";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deletedByRole: Role | null;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
    role: Role;
    registrations?: {
      status: RegistrationStatus;
    }[];
  };
};

type PostCommentsProps = {
  postId: string;
  eventCreatorId?: string; // Pass event creator ID to check permissions
  eventManagerIds?: string[]; // Pass event manager IDs
};

export const PostComments = ({
  postId,
  eventCreatorId,
  eventManagerIds = [],
}: PostCommentsProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchedEventCreatorId, setFetchedEventCreatorId] = useState<
    string | undefined
  >(eventCreatorId);
  const [fetchedEventManagerIds, setFetchedEventManagerIds] =
    useState<string[]>(eventManagerIds);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`);
      setComments(response.data.comments || response.data);
      // Update event creator and manager IDs if provided in response
      if (response.data.eventCreatorId) {
        setFetchedEventCreatorId(response.data.eventCreatorId);
      }
      if (response.data.eventManagerIds) {
        setFetchedEventManagerIds(response.data.eventManagerIds);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "unauthenticated") {
      toast.error("Bạn cần đăng nhập để bình luận!");
      router.push("/login");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, {
        content: newComment.trim(),
      });
      setComments([...comments, response.data]);
      setNewComment("");
      toast.success("Đã thêm bình luận!");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data || "Có lỗi khi thêm bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      await axios.delete(`/api/comments/${commentId}/delete`);
      // Update the comment in the list to show it's deleted
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
                deletedBy: session?.user?.id || null,
                deletedByRole: session?.user?.role || null,
              }
            : comment
        )
      );
      toast.success("Đã xóa bình luận!");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Không thể xóa bình luận");
    }
  };

  const handleLoadMoreComments = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const displayedComments = comments.slice(0, displayCount);
  const remainingComments = comments.length - displayCount;

  return (
    <div className="space-y-2 flex-1 max-w-2xl">
      {/* Comment toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{comments.length}</span>
      </button>

      {/* Comments section */}
      {isExpanded && (
        <div className="mt-3 space-y-3 pt-3">
          {/* Comments list */}
          {isLoading ? (
            <p className="text-sm text-gray-500">Đang tải bình luận...</p>
          ) : comments.length > 0 ? (
            <>
              <div className="space-y-2">
                {displayedComments.map((comment) => {
                  const avatarUrl = comment.user.imageUrl
                    ? "/" +
                      comment.user.imageUrl
                        .replace(/\\/g, "/")
                        .replace(/^\/+/, "")
                    : null;

                  return (
                    <div
                      key={comment.id}
                      className="flex gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-shrink-0">
                        {avatarUrl ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative">
                            <Image
                              src={avatarUrl}
                              alt="Avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs text-primary font-bold">
                              {comment.user.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.user.name || "Người dùng"}
                            </p>
                            {/* Show badge for admin */}
                            {comment.user.role === "ADMIN" && (
                              <span className="badge badge-error badge-xs">
                                Quản trị viên
                              </span>
                            )}
                            {/* Show badge for event creator */}
                            {comment.user.id === fetchedEventCreatorId &&
                              comment.user.role !== "ADMIN" && (
                                <span className="badge badge-primary badge-xs">
                                  Người tạo sự kiện
                                </span>
                              )}
                            {/* Show badge for event manager */}
                            {fetchedEventManagerIds.includes(comment.user.id) &&
                              comment.user.id !== fetchedEventCreatorId &&
                              comment.user.role !== "ADMIN" && (
                                <span className="badge badge-secondary badge-xs">
                                  Người quản lý sự kiện
                                </span>
                              )}
                            {/* Show badge for registered volunteer */}
                            {comment.user.registrations &&
                              comment.user.registrations.length > 0 &&
                              comment.user.registrations[0].status ===
                                "APPROVED" &&
                              comment.user.id !== fetchedEventCreatorId &&
                              !fetchedEventManagerIds.includes(
                                comment.user.id
                              ) &&
                              comment.user.role !== "ADMIN" && (
                                <span className="badge badge-success badge-xs">
                                  Tình nguyện viên
                                </span>
                              )}
                          </div>
                          {/* Delete button for admin/event creator/event manager */}
                          {!comment.isDeleted &&
                            (session?.user?.role === "ADMIN" ||
                              session?.user?.id === fetchedEventCreatorId ||
                              fetchedEventManagerIds.includes(
                                session?.user?.id || ""
                              )) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-error hover:bg-error/10 p-1 rounded transition-colors"
                                title="Xóa bình luận"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                        </div>

                        {comment.isDeleted ? (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500 italic">
                              Bình luận này đã bị xóa bởi{" "}
                              {comment.deletedByRole === "ADMIN"
                                ? "Quản trị viên"
                                : "Người quản lý sự kiện"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {comment.deletedAt &&
                                new Date(comment.deletedAt).toLocaleString(
                                  "vi-VN"
                                )}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {comment.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(comment.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load more comments button */}
              {remainingComments > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadMoreComments}
                    className="text-sm text-primary hover:text-primary/80 font-medium px-4 py-2 rounded-lg hover:bg-primary/5 transition-all"
                  >
                    Ấn để tải {Math.min(5, remainingComments)} bình luận tiếp
                    theo
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Chưa có bình luận nào</p>
          )}

          {/* Add comment form */}
          {status === "authenticated" && (
            <div className="space-y-1">
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  placeholder="Viết bình luận..."
                  maxLength={500}
                  rows={2}
                  className="flex-1 px-4 py-3 text-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none overflow-hidden min-h-[60px]"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="self-end shrink-0 p-3 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="text-xs text-gray-500 text-right px-2">
                {newComment.length}/500 ký tự
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
