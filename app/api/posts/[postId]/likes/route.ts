// API route for managing post likes
// app/api/posts/[postId]/likes/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

// GET: Check if user liked the post and get total likes count
export async function GET(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    const session = await getServerSession(authOptions);

    const likesCount = await prisma.postLike.count({
      where: { postId },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const userLike = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({ likesCount, isLiked });
  } catch (error) {
    console.error("LỖI KHI LẤY THÔNG TIN LIKE:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

// POST: Like a post
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const existing = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existing) {
      return new NextResponse("Already liked this post", { status: 400 });
    }

    await prisma.postLike.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    return NextResponse.json({ message: "Liked post" });
  } catch (error) {
    console.error("LỖI KHI LIKE POST:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

// DELETE: Unlike a post
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = await context.params;

    const like = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (!like) {
      return new NextResponse("Not liked this post", { status: 404 });
    }

    await prisma.postLike.delete({
      where: { id: like.id },
    });

    return NextResponse.json({ message: "Unliked post" });
  } catch (error) {
    console.error("LỖI KHI UNLIKE POST:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
