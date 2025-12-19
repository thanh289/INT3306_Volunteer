// A client component for the event's communication wall.
// components/features/event-wall.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { RegistrationStatus, EventStatus, Role } from "@prisma/client";
import Image from "next/image";
import toast from "react-hot-toast";
import { PostLikeButton } from "./post-like-button";
import { PostComments } from "./post-comments";
import { Trash2, Check, X, Clock, Pin } from "lucide-react";

interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  isPinned?: boolean;
  postStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: string | null;
  reviewedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deletedByRole: Role | null;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
    role: Role;
    registrations?: {
      status: RegistrationStatus;
    }[];
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

type SortOption = "recent" | "likes" | "comments";

type EventWallProps = {
  eventId: string;
  creatorId: string;
  isRegistered: boolean;
  registrationStatus?: RegistrationStatus;
  eventStatus: EventStatus;
  eventManagerIds: string[];
};

export const EventWall = ({
  eventId,
  creatorId,
  isRegistered: _isRegistered,
  registrationStatus: _registrationStatus,
  eventStatus,
  eventManagerIds,
}: EventWallProps) => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const content = post.content.toLowerCase();
    const authorName = (
      post.author.name ||
      post.author.email ||
      ""
    ).toLowerCase();
    return content.includes(query) || authorName.includes(query);
  });

  // Fetch posts with sort option - extracted as a standalone function
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/events/${eventId}/posts?sortBy=${sortBy}&skip=0&take=10`
      );
      setPosts(response.data.posts);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const response = await axios.get(
        `/api/events/${eventId}/posts?sortBy=${sortBy}&skip=${posts.length}&take=10`
      );
      setPosts([...posts, ...response.data.posts]);
    } catch (error) {
      console.error("Failed to load more posts:", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB");
        return;
      }
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setPostImagePreview(null);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent form from reload
    if (!newPostContent.trim() && !postImage) return; // exit if no content and no image

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", newPostContent);
      if (postImage) {
        formData.append("image", postImage);
      }

      await axios.post(`/api/events/${eventId}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form and filters
      setNewPostContent(""); // delete content in the form
      setPostImage(null);
      setPostImagePreview(null);
      setSearchQuery(""); // reset search
      setSortBy("recent"); // reset sort to default

      // Reload posts to get fresh data with correct order
      await fetchPosts();

      toast.success("Đăng bài thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Có lỗi xảy ra khi đăng bài");
      }
      console.error("Failed to submit post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      await axios.delete(`/api/posts/${postId}/delete`);
      // Update the post in the list to show it's deleted
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
                deletedBy: session?.user?.id || null,
                deletedByRole: session?.user?.role || null,
              }
            : post
        )
      );
      toast.success("Đã xóa bài viết!");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Không thể xóa bài viết");
    }
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    try {
      await axios.patch(`/api/posts/${postId}/pin`, {
        isPinned: !isPinned,
      });

      // Refresh posts to get updated order
      fetchPosts();

      toast.success(
        !isPinned ? "Bài viết đã được ghim!" : "Đã bỏ ghim bài viết!"
      );
    } catch (error) {
      console.error("Failed to pin post:", error);
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleReviewPost = async (
    postId: string,
    action: "approve" | "reject"
  ) => {
    try {
      await axios.patch(`/api/posts/${postId}/review`, { action });
      // Update post status in the list
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                postStatus: action === "approve" ? "APPROVED" : "REJECTED",
                reviewedAt: new Date().toISOString(),
                reviewedBy: session?.user?.id || null,
              }
            : post
        )
      );
      toast.success(
        action === "approve" ? "Đã duyệt bài viết!" : "Đã từ chối bài viết!"
      );
    } catch (error) {
      console.error("Failed to review post:", error);
      toast.error("Không thể thực hiện thao tác");
    }
  };

  // Improved authorization logic
  const isAuthenticated = status === "authenticated";
  const isUserActive = session?.user?.status === "ACTIVE";
  const isEventPublished = eventStatus === "PUBLISHED";
  const isAdmin = session?.user?.role === "ADMIN";
  const isCreator = session?.user?.id === creatorId;
  const isEventManager = eventManagerIds.includes(session?.user?.id || "");
  const isPrivileged = isAdmin || isCreator || isEventManager;

  // Condition: login & not being locked & event published (must be published for everyone, including admin)
  const canPost = isAuthenticated && isUserActive && isEventPublished;

  // Condition: can view posts (privileged users can view even if not published)
  const canViewPosts =
    isAuthenticated && isUserActive && (isEventPublished || isPrivileged);

  // Determine what message to show
  const getAccessMessage = () => {
    if (!isAuthenticated) {
      return {
        type: "info",
        icon: (
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        message: "Vui lòng đăng nhập để xem kênh trao đổi.",
      };
    }

    if (!isUserActive) {
      return {
        type: "error",
        icon: (
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      };
    }

    if (!isEventPublished && !isPrivileged) {
      return {
        type: "info",
        icon: (
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        message:
          "Sự kiện đang chờ duyệt. Kênh trao đổi sẽ mở sau khi sự kiện được công bố.",
      };
    }

    return null;
  };

  const accessMessage = getAccessMessage();

  // Alert type mapping
  const alertTypeClass = {
    info: "alert-info",
    warning: "alert-warning",
    error: "alert-error",
    success: "alert-success",
  };

  // Không hiển thị kênh trao đổi nếu event chưa được duyệt
  if (!isEventPublished) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
        <div className="flex items-center gap-3">
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
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          <h2 className="text-2xl font-semibold">Kênh trao đổi</h2>
        </div>
      </div>

      {/* Access message */}
      {accessMessage && (
        <div
          className={`alert ${
            alertTypeClass[accessMessage.type as keyof typeof alertTypeClass]
          } mb-6 shadow-lg`}
        >
          {accessMessage.icon}
          <span>{accessMessage.message}</span>
        </div>
      )}

      {/* Post form - only show if user can post */}
      {canPost && (
        <form onSubmit={handleSubmitPost} className="mb-8">
          <div className="bg-base-100 rounded-2xl shadow-md p-4 border-2 border-base-300">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Bạn có câu hỏi hoặc muốn chia sẻ điều gì?"
              className="textarea textarea-bordered h-24 resize-none w-full rounded-xl bg-base-100 focus:border-primary focus:outline-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="label ml-2">
              <span className="label-text-alt text-base-content/60">
                {newPostContent.length}/500 ký tự
              </span>
            </div>

            {/* Image preview */}
            {postImagePreview && (
              <div className="relative mt-2 mb-2">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-base-300">
                  <Image
                    src={postImagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              {/* Image upload button */}
              <label className="btn btn-ghost btn-sm gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Thêm ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  isSubmitting || (!newPostContent.trim() && !postImage)
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                    Đăng bài
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search and Sort Controls - only show if user can view posts */}
      {canViewPosts && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search bar */}
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo nội dung hoặc tên người đăng..."
                className="input input-bordered w-full pl-10 pr-4 rounded-xl bg-base-100 shadow-sm border-2 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="select select-bordered w-full sm:w-auto text-base pr-10 rounded-xl bg-base-100 shadow-sm border-2 focus:border-primary focus:outline-none"
            >
              <option value="recent">Gần đây</option>
              <option value="likes">Nhiều tym</option>
              <option value="comments">Nhiều bình luận</option>
            </select>
          </div>

          {/* Post list */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-32 w-full"></div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="avatar placeholder w-8 h-8 relative rounded-full overflow-hidden">
                        {post.author.imageUrl ? (
                          <Image
                            src={
                              "/" +
                              post.author.imageUrl
                                .replace(/\\/g, "/")
                                .replace(/^\/+/, "")
                            }
                            alt={
                              post.author.name || post.author.email || "Avatar"
                            }
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary">
                            <span className="text-sm font-semibold">
                              {(post.author.name || post.author.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base-content flex items-center gap-2 flex-wrap">
                          <span>{post.author.name || post.author.email}</span>
                          {/* Show badge for admin */}
                          {post.author.role === "ADMIN" && (
                            <span className="badge badge-error badge-sm">
                              Quản trị viên
                            </span>
                          )}
                          {/* Show badge for event creator */}
                          {post.authorId === creatorId &&
                            post.author.role !== "ADMIN" && (
                              <span className="badge badge-primary badge-sm">
                                Người tạo sự kiện
                              </span>
                            )}
                          {/* Show badge for event manager */}
                          {eventManagerIds.includes(post.authorId) &&
                            post.authorId !== creatorId &&
                            post.author.role !== "ADMIN" && (
                              <span className="badge badge-secondary badge-sm">
                                Người quản lý sự kiện
                              </span>
                            )}
                          {/* Show badge for registered participant */}
                          {post.author.registrations &&
                            post.author.registrations.length > 0 &&
                            post.author.registrations[0].status ===
                              "APPROVED" &&
                            post.authorId !== creatorId &&
                            !eventManagerIds.includes(post.authorId) &&
                            post.author.role !== "ADMIN" && (
                              <span className="badge badge-success badge-sm">
                                Tình nguyện viên
                              </span>
                            )}
                        </p>
                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(post.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      {/* Action buttons for admin/event creator/event manager */}
                      {!post.isDeleted &&
                        (session?.user?.role === "ADMIN" ||
                          session?.user?.id === creatorId ||
                          eventManagerIds.includes(
                            session?.user?.id || ""
                          )) && (
                          <div className="flex gap-1">
                            {/* Pin button */}
                            <button
                              onClick={() =>
                                handlePinPost(post.id, post.isPinned || false)
                              }
                              className={`btn btn-ghost btn-sm ${
                                post.isPinned
                                  ? "text-primary hover:bg-primary/10"
                                  : "hover:bg-base-200"
                              }`}
                              title={
                                post.isPinned ? "Bỏ ghim" : "Ghim bài viết"
                              }
                            >
                              <Pin
                                className={`w-4 h-4 ${
                                  post.isPinned ? "fill-current" : ""
                                }`}
                              />
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              title="Xóa bài viết"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Pinned Badge */}
                    {post.isPinned && (
                      <div className="mb-3">
                        <span className="badge badge-primary gap-2">
                          <Pin className="w-3 h-3 fill-current" />
                          Đã ghim
                        </span>
                      </div>
                    )}

                    {/* Post Status Badge */}
                    {post.postStatus === "PENDING" && (
                      <div className="mb-3">
                        <span className="badge badge-warning gap-2">
                          <Clock className="w-3 h-3" />
                          Đang chờ duyệt
                        </span>
                      </div>
                    )}
                    {post.postStatus === "REJECTED" && (
                      <div className="mb-3">
                        <span className="badge badge-error gap-2">
                          <X className="w-3 h-3" />
                          Đã bị từ chối
                        </span>
                      </div>
                    )}

                    {/* Post content or deleted message */}
                    {post.isDeleted ? (
                      <div className="bg-base-200 p-4 rounded-lg mb-3">
                        <p className="text-base-content/60 italic">
                          Bài viết này đã bị xóa bởi{" "}
                          {post.deletedByRole === "ADMIN"
                            ? "Quản trị viên"
                            : "Người quản lý sự kiện"}
                          .
                        </p>
                        <p className="text-xs text-base-content/50 mt-1">
                          Thời gian xóa:{" "}
                          {post.deletedAt &&
                            new Date(post.deletedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-base-content whitespace-pre-wrap mb-3">
                          {post.content}
                        </p>
                        {/* Post image */}
                        {post.imageUrl && (
                          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-3 border border-base-300">
                            <Image
                              src={
                                "/" +
                                post.imageUrl
                                  .replace(/\\/g, "/")
                                  .replace(/^\/+/, "")
                              }
                              alt="Post image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Review buttons for pending posts */}
                    {post.postStatus === "PENDING" &&
                      !post.isDeleted &&
                      post.authorId !== session?.user?.id && // Don't show review buttons for own posts
                      (session?.user?.role === "ADMIN" ||
                        session?.user?.id === creatorId ||
                        eventManagerIds.includes(session?.user?.id || "")) && (
                        <div className="flex gap-2 mb-3 pt-2 border-t">
                          <button
                            onClick={() => handleReviewPost(post.id, "approve")}
                            className="btn btn-sm btn-success gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Duyệt bài
                          </button>
                          <button
                            onClick={() => handleReviewPost(post.id, "reject")}
                            className="btn btn-sm btn-error gap-2"
                          >
                            <X className="w-4 h-4" />
                            Từ chối
                          </button>
                        </div>
                      )}

                    {/* Like and Comment buttons - only show if not deleted, approved, and event is published */}
                    {!post.isDeleted &&
                      post.postStatus === "APPROVED" &&
                      isEventPublished && (
                        <div className="flex items-start gap-3 pt-2 border-t">
                          <PostLikeButton postId={post.id} />
                          <PostComments
                            postId={post.id}
                            eventCreatorId={creatorId}
                            eventManagerIds={eventManagerIds}
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card bg-base-100 border border-base-300 ">
                <div className="card-body items-center text-center py-12 ">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-200 mb-4 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-base-content/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-base-content/60">
                    {searchQuery.trim()
                      ? "Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn."
                      : `Chưa có bài viết nào. ${
                          canPost ? "Hãy là người đầu tiên!" : ""
                        }`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {!isLoading && posts.length < totalCount && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="btn btn-outline btn-primary"
              >
                {isLoadingMore ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Đang tải...
                  </>
                ) : (
                  <>
                    Ấn để tải {Math.min(10, totalCount - posts.length)} bài viết
                    tiếp theo
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
