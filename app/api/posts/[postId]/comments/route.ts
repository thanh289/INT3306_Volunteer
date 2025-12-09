// API route for managing post comments
// app/api/posts/[postId]/comments/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

// GET: Get all comments for a post
export async function GET(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;

    const comments = await prisma.postComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("LỖI KHI LẤY COMMENTS:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

// POST: Create a new comment
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = await context.params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return new NextResponse("Content is required", { status: 400 });
    }

    if (content.trim().length > 500) {
      return new NextResponse("Bình luận không được vượt quá 500 ký tự", {
        status: 400,
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Create comment
    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("LỖI KHI TẠO COMMENT:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
