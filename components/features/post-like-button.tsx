// Component for liking/unliking a post
// components/features/post-like-button.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

type PostLikeButtonProps = {
  postId: string;
};

export const PostLikeButton = ({ postId }: PostLikeButtonProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch like status and count
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await axios.get(`/api/posts/${postId}/likes`);
        setLikesCount(response.data.likesCount);
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    fetchLikeStatus();
  }, [postId]);

  const handleClick = async () => {
    if (status === "unauthenticated") {
      toast.error("Bạn cần đăng nhập để thích bài viết!");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        await axios.delete(`/api/posts/${postId}/likes`);
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await axios.post(`/api/posts/${postId}/likes`);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Có lỗi xảy ra khi thích bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-50 ${
        isLiked
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
};
