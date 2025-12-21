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

    await prisma.$transaction(async (tx) => {
      const deletedLikes = await tx.postLike.deleteMany({
        where: { postId },
      });
      console.log(`Deleted ${deletedLikes.count} likes for post ${postId}`);

      const deletedComments = await tx.postComment.deleteMany({
        where: { postId },
      });
      console.log(
        `Deleted ${deletedComments.count} comments for post ${postId}`
      );

      await tx.post.delete({
        where: { id: postId },
      });
      console.log(`Post ${postId} permanently deleted from database`);
    });

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
