// API route for approving or rejecting posts
// app/api/posts/[postId]/review/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

type RouteParams = {
  params: Promise<{
    postId: string;
  }>;
};

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const { action } = validation.data;

    // Get post with event info
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            eventManagers: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Bài viết không tồn tại", { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isCreator = session.user.id === post.event.creatorId;
    const isEventManager = post.event.eventManagers.some(
      (m) => m.userId === session.user.id
    );

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          postStatus: action === "approve" ? "APPROVED" : "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
              role: true,
            },
          },
        },
      });

      if (post.authorId !== session.user.id) {
        const notificationMessage =
          action === "approve"
            ? `Bài viết của bạn trong sự kiện "${post.event.title}" đã được duyệt!`
            : `Bài viết của bạn trong sự kiện "${post.event.title}" đã bị từ chối.`;

        await tx.notification.create({
          data: {
            userId: post.authorId,
            message: notificationMessage,
            href: `/events/${post.event.id}`,
          },
        });
      }

      return updatedPost;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("LỖI KHI DUYỆT BÀI VIẾT:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
