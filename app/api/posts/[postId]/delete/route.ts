// API route for soft deleting a post
// app/api/posts/[postId]/delete/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

// DELETE: Soft delete a post (admin or event manager only)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = await context.params;

    // Get the post with event info
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        event: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Check if user is admin or event manager of this event
    const isAdmin = session.user.role === "ADMIN";
    const isEventManager =
      session.user.role === "EVENT_MANAGER" &&
      post.event.creatorId === session.user.id;

    if (!isAdmin && !isEventManager) {
      return new NextResponse(
        "Forbidden: Only admins or event managers can delete posts",
        { status: 403 }
      );
    }

    // Soft delete the post and delete all likes and comments
    const [deletedPost] = await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
          deletedByRole: session.user.role,
        },
      }),
      // Delete all likes for this post
      prisma.postLike.deleteMany({
        where: { postId },
      }),
      // Delete all comments for this post
      prisma.postComment.deleteMany({
        where: { postId },
      }),
    ]);

    return NextResponse.json({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
