// API route for managing post comments
// app/api/posts/[postId]/comments/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { apiRateLimiter, withRateLimit } from "@/lib/rate-limit";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

// GET: Get all comments for a post
export async function GET(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        eventId: true,
        event: {
          select: {
            creatorId: true,
            eventManagers: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const comments = await prisma.postComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            role: true,
            registrations: {
              where: { eventId: post.eventId },
              select: { status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      comments,
      eventCreatorId: post.event.creatorId,
      eventManagerIds: post.event.eventManagers.map((m) => m.userId),
    });
  } catch (error) {
    console.error("LỖI KHI LẤY COMMENTS:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const rateLimitError = await withRateLimit(
      request,
      apiRateLimiter,
      session.user.id
    );
    if (rateLimitError) {
      return rateLimitError;
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        eventId: true,
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

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
            role: true,
            registrations: {
              where: { eventId: post.eventId },
              select: { status: true },
            },
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
