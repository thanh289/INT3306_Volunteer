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

    // Get the post with event info and check if user is event manager
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        event: {
          select: {
            creatorId: true,
            eventManagers: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Check if user is admin, event creator, or event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = post.event.creatorId === session.user.id;
    const isEventManager = post.event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse(
        "Forbidden: Only admins, event creators, or event managers can delete posts",
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
