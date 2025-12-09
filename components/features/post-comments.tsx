// Component for displaying and adding comments to a post
// components/features/post-comments.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { MessageCircle, Send } from "lucide-react";
import Image from "next/image";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
};

type PostCommentsProps = {
  postId: string;
};

export const PostComments = ({ postId }: PostCommentsProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`);
      setComments(response.data);
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

  return (
    <div className="space-y-2">
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
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => {
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
                            {comment.user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user.name || "Người dùng"}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có bình luận nào</p>
          )}

          {/* Add comment form */}
          {status === "authenticated" && (
            <div className="space-y-1">
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  maxLength={500}
                  className="flex-1 px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
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
