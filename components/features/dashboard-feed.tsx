// Dashboard feed component showing posts from all events
// components/features/dashboard-feed.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { PostLikeButton } from "./post-like-button";
import { PostComments } from "./post-comments";
import {
  Trash2,
  Filter,
  Clock,
  Heart as HeartIcon,
  MessageCircle,
  Calendar,
  Star,
  Ban,
  TrendingUp,
} from "lucide-react";
import { Role, EventCategory } from "@prisma/client";

interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deletedByRole: Role | null;
  authorId: string;
  author: {
    name: string | null;
    email: string | null;
    imageUrl: string | null;
    role: Role;
    registrations?: {
      status: string;
      eventId: string;
    }[];
  };
  event: {
    id: string;
    title: string;
    category: EventCategory;
    creatorId: string;
    isCancelled?: boolean;
    eventManagers: {
      userId: string;
    }[];
  };
  isUpcomingEvent?: boolean;
  isInterestedEvent?: boolean;
  _count?: {
    likes: number;
    comments: true;
  };
}

const CATEGORIES = [
  {
    value: "ENVIRONMENT",
    label: "Môi trường",
    icon: "/images/environment.png",
  },
  { value: "EDUCATION", label: "Giáo dục", icon: "/images/education.png" },
  { value: "HEALTHCARE", label: "Y tế", icon: "/images/health.png" },
  { value: "COMMUNITY", label: "Cộng đồng", icon: "/images/community.png" },
];

type SortOption =
  | "recent"
  | "trending"
  | "likes"
  | "comments"
  | "upcoming"
  | "interested";

export const DashboardFeed = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // Input field value
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedCategories, sortBy]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // For upcoming/interested/trending, we need server sort by recent first, then client sort
      const serverSortBy =
        sortBy === "upcoming" ||
          sortBy === "interested" ||
          sortBy === "trending"
          ? sortBy === "trending"
            ? "trending"
            : "recent"
          : sortBy;

      const params = new URLSearchParams({
        skip: "0",
        take: "50", // Fetch more for client-side filtering
        sortBy: serverSortBy,
      });
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (selectedCategories.length > 0) {
        params.append("categories", selectedCategories.join(","));
      }

      const response = await axios.get(`/api/dashboard/posts?${params}`);
      let fetchedPosts = response.data.posts;

      // Client-side sorting for upcoming/interested/trending
      if (sortBy === "upcoming") {
        fetchedPosts = fetchedPosts.filter((p: Post) => p.isUpcomingEvent);
      } else if (sortBy === "interested") {
        fetchedPosts = fetchedPosts.filter((p: Post) => p.isInterestedEvent);
      } else if (sortBy === "trending") {
        // Sort by engagement score (likes + comments)
        fetchedPosts = fetchedPosts.sort((a: Post, b: Post) => {
          const aScore = (a._count?.likes || 0) + (a._count?.comments || 0);
          const bScore = (b._count?.likes || 0) + (b._count?.comments || 0);
          return bScore - aScore;
        });
      }

      // Take only first 10 for display
      setPosts(fetchedPosts.slice(0, 10));
      setTotalCount(fetchedPosts.length);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Không thể tải bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const serverSortBy =
        sortBy === "upcoming" ||
          sortBy === "interested" ||
          sortBy === "trending"
          ? sortBy === "trending"
            ? "trending"
            : "recent"
          : sortBy;

      const params = new URLSearchParams({
        skip: "0",
        take: "100", // Fetch more for filtering
        sortBy: serverSortBy,
      });
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (selectedCategories.length > 0) {
        params.append("categories", selectedCategories.join(","));
      }

      const response = await axios.get(`/api/dashboard/posts?${params}`);
      let fetchedPosts = response.data.posts;

      // Client-side filtering
      if (sortBy === "upcoming") {
        fetchedPosts = fetchedPosts.filter((p: Post) => p.isUpcomingEvent);
      } else if (sortBy === "interested") {
        fetchedPosts = fetchedPosts.filter((p: Post) => p.isInterestedEvent);
      } else if (sortBy === "trending") {
        // Sort by engagement score (likes + comments)
        fetchedPosts = fetchedPosts.sort((a: Post, b: Post) => {
          const aScore = (a._count?.likes || 0) + (a._count?.comments || 0);
          const bScore = (b._count?.likes || 0) + (b._count?.comments || 0);
          return bScore - aScore;
        });
      }

      setPosts(fetchedPosts.slice(0, posts.length + 10));
      setTotalCount(fetchedPosts.length);
    } catch (error) {
      console.error("Failed to load more posts:", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      await axios.delete(`/api/posts/${postId}/delete`);
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

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-12 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-48 w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex gap-3 items-center flex-wrap">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[250px]">
          <Image
            src="/images/search.png"
            alt="Search"
            width={18}
            height={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm... (Nhấn Enter)"
            className="input input-bordered w-full pl-10 pr-4 rounded-xl bg-base-100 shadow-sm border-2 focus:border-primary focus:outline-none"
          />
        </form>

        {/* Sort Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowCategoryDropdown(false);
            }}
            className="btn btn-outline gap-2"
          >
            {sortBy === "recent" && <Clock className="h-4 w-4" />}
            {sortBy === "trending" && <TrendingUp className="h-4 w-4" />}
            {sortBy === "likes" && <HeartIcon className="h-4 w-4" />}
            {sortBy === "comments" && <MessageCircle className="h-4 w-4" />}
            {sortBy === "upcoming" && <Calendar className="h-4 w-4" />}
            {sortBy === "interested" && <Star className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {sortBy === "recent" && "Gần đây"}
              {sortBy === "trending" && "Nổi bật gần đây"}
              {sortBy === "likes" && "Nhiều tym"}
              {sortBy === "comments" && "Nhiều bình luận"}
              {sortBy === "upcoming" && "Sự kiện sắp tới"}
              {sortBy === "interested" && "Quan tâm"}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${showSortDropdown ? "rotate-180" : ""
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Sort Dropdown */}
          {showSortDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-[220px]">
              <ul className="menu menu-sm p-2">
                <li>
                  <button
                    onClick={() => {
                      setSortBy("recent");
                      setShowSortDropdown(false);
                    }}
                    className={sortBy === "recent" ? "active" : ""}
                  >
                    <Clock className="h-4 w-4" />
                    Gần đây
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("trending");
                      setShowSortDropdown(false);
                    }}
                    className={sortBy === "trending" ? "active" : ""}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Nổi bật gần đây
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("likes");
                      setShowSortDropdown(false);
                    }}
                    className={sortBy === "likes" ? "active" : ""}
                  >
                    <HeartIcon className="h-4 w-4" />
                    Nhiều tym
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("comments");
                      setShowSortDropdown(false);
                    }}
                    className={sortBy === "comments" ? "active" : ""}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Nhiều bình luận
                  </button>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("upcoming");
                      setShowSortDropdown(false);
                    }}
                    className={sortBy === "upcoming" ? "active" : ""}
                  >
                    <Calendar className="h-4 w-4" />
                    Sự kiện sắp tới của bạn
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSortBy("interested");
                      setShowSortDropdown(false);
                    }}
                    className={sortBy === "interested" ? "active" : ""}
                  >
                    <Star className="h-4 w-4" />
                    Sự kiện quan tâm
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Category Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowSortDropdown(false);
            }}
            className="btn btn-outline gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>
              {selectedCategories.length === 0
                ? "Thể loại"
                : `Thể loại (${selectedCategories.length})`}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${showCategoryDropdown ? "rotate-180" : ""
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-[220px]">
              <div className="p-4 space-y-2">
                {CATEGORIES.map((category) => (
                  <label
                    key={category.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryToggle(category.value)}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-sm flex items-center gap-2">
                      <img
                        src={category.icon}
                        alt={category.label}
                        className="w-4 h-4 object-contain"
                      />
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-200 mb-4">
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
              {searchQuery.trim() || selectedCategories.length > 0
                ? "Không tìm thấy bài viết nào phù hợp."
                : "Chưa có bài viết nào."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <div
              key={post.id}
              className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="card-body">
                {/* Event title header with labels */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Link
                    href={`/events/${post.event.id}`}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image
                        src={
                          CATEGORIES.find(
                            (cat) => cat.value === post.event.category
                          )?.icon || "/images/placeholder.png"
                        }
                        alt="Category icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span>{post.event.title}</span>
                  </Link>
                  <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
                    {post.event.isCancelled && (
                      <span className="badge badge-error badge-sm whitespace-nowrap gap-1">
                        <Ban className="h-3 w-3" />
                        Đã bị hủy
                      </span>
                    )}
                    {/* Only show upcoming if event is not cancelled */}
                    {!post.event.isCancelled && post.isUpcomingEvent && (
                      <span className="badge badge-info badge-sm whitespace-nowrap gap-1">
                        <Calendar className="h-3 w-3" />
                        Sắp tới
                      </span>
                    )}
                    {post.isInterestedEvent && (
                      <span className="badge badge-warning badge-sm whitespace-nowrap gap-1">
                        <Star className="h-3 w-3" />
                        Quan tâm
                      </span>
                    )}
                  </div>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar placeholder w-10 h-10 relative rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                    {post.author.imageUrl ? (
                      <Image
                        src={
                          "/" +
                          post.author.imageUrl
                            .replace(/\\/g, "/")
                            .replace(/^\/+/, "")
                        }
                        alt={post.author.name || post.author.email || "Avatar"}
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
                      {post.authorId === post.event.creatorId &&
                        post.author.role !== "ADMIN" && (
                          <span className="badge badge-primary badge-sm">
                            Người tạo sự kiện
                          </span>
                        )}
                      {/* Show badge for event manager */}
                      {post.event.eventManagers.some(
                        (m) => m.userId === post.authorId
                      ) &&
                        post.authorId !== post.event.creatorId &&
                        post.author.role !== "ADMIN" && (
                          <span className="badge badge-secondary badge-sm">
                            Người quản lý sự kiện
                          </span>
                        )}
                      {/* Show badge for volunteer (registered participant) */}
                      {post.author.registrations &&
                        post.author.registrations.length > 0 &&
                        post.author.registrations.some(
                          (reg) =>
                            reg.eventId === post.event.id &&
                            reg.status === "APPROVED"
                        ) &&
                        post.authorId !== post.event.creatorId &&
                        !post.event.eventManagers.some(
                          (m) => m.userId === post.authorId
                        ) &&
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
                  {/* Delete button for admin/event creator/event manager */}
                  {!post.isDeleted &&
                    (session?.user?.role === "ADMIN" ||
                      session?.user?.id === post.event.creatorId ||
                      post.event.eventManagers.some(
                        (m) => m.userId === session?.user?.id
                      )) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                </div>

                {/* Post content or deleted message */}
                {post.isDeleted ? (
                  <div className="bg-error/5 border border-error/20 p-4 rounded-lg mb-3">
                    <p className="text-error/80 italic flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span>
                        Bài viết này đã bị xóa bởi{" "}
                        {post.deletedByRole === "ADMIN"
                          ? "Quản trị viên"
                          : "Người quản lý sự kiện"}
                      </span>
                    </p>
                    <p className="text-xs text-error/60 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {post.deletedAt &&
                          new Date(post.deletedAt).toLocaleString("vi-VN")}
                      </span>
                    </p>
                  </div>
                ) : (
                  <>
                    {post.content && (
                      <div className="bg-base-200/30 p-4 rounded-lg mb-3">
                        <p className="text-base-content whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    )}
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

                {/* Like and Comment buttons */}
                {!post.isDeleted && (
                  <div className="flex items-start gap-3 pt-3 border-t-2 border-base-200">
                    <PostLikeButton postId={post.id} />
                    <PostComments
                      postId={post.id}
                      eventCreatorId={post.event.creatorId}
                      eventManagerIds={post.event.eventManagers.map(
                        (m) => m.userId
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {posts.length < totalCount && (
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
