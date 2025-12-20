// API route for soft deleting a post
// app/api/posts/[postId]/delete/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { dataCache } from "@/lib/cache";

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

    // Use transaction to ensure atomicity - delete likes/comments first, then delete post
    await prisma.$transaction(async (tx) => {
      // Delete all likes for this post FIRST
      const deletedLikes = await tx.postLike.deleteMany({
        where: { postId },
      });
      console.log(`Deleted ${deletedLikes.count} likes for post ${postId}`);

      // Delete all comments for this post
      const deletedComments = await tx.postComment.deleteMany({
        where: { postId },
      });
      console.log(
        `Deleted ${deletedComments.count} comments for post ${postId}`
      );

      // Hard delete the post - remove from database completely
      await tx.post.delete({
        where: { id: postId },
      });
      console.log(`Post ${postId} permanently deleted from database`);
    });

    // Invalidate cache AFTER transaction completes successfully
    dataCache.invalidatePattern("dashboard:posts:");
    console.log("Cache invalidated after post deletion:", postId);

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
