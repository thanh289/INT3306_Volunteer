// API route for pinning/unpinning posts
// app/api/posts/[postId]/pin/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    postId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const { isPinned } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        event: {
          select: {
            creatorId: true,
            eventManagers: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isCreator = session.user.id === post.event.creatorId;
    const isEventManager = post.event.eventManagers.some(
      (m) => m.userId === session.user.id
    );

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isPinned: isPinned,
        pinnedAt: isPinned ? new Date() : null,
        pinnedBy: isPinned ? session.user.id : null,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error pinning/unpinning post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
