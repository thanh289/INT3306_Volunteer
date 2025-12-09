// API route for soft deleting a comment
// app/api/comments/[commentId]/delete/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

// DELETE: Soft delete a comment (admin or event manager only)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { commentId } = await context.params;

    // Get the comment with post and event info
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          include: {
            event: {
              select: {
                creatorId: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    // Check if user is admin or event manager of this event
    const isAdmin = session.user.role === "ADMIN";
    const isEventManager =
      session.user.role === "EVENT_MANAGER" &&
      comment.post.event.creatorId === session.user.id;

    if (!isAdmin && !isEventManager) {
      return new NextResponse(
        "Forbidden: Only admins or event managers can delete comments",
        { status: 403 }
      );
    }

    // Soft delete the comment
    const deletedComment = await prisma.postComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
        deletedByRole: session.user.role,
      },
    });

    return NextResponse.json({
      message: "Comment deleted successfully",
      comment: deletedComment,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
