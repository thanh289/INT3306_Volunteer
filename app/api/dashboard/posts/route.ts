// API route for fetching dashboard posts feed
// app/api/dashboard/posts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");
    const search = searchParams.get("search") || "";
    const categoriesParam = searchParams.get("categories") || "";
    const categories = categoriesParam ? categoriesParam.split(",") : [];
    const sortBy = searchParams.get("sortBy") || "recent";

    // Get user's upcoming and interested events
    const [upcomingEventIds, interestedEventIds] = await Promise.all([
      prisma.registration
        .findMany({
          where: {
            userId: session.user.id,
            event: {
              startDateTime: { gte: new Date() },
              status: "PUBLISHED",
              isDeleted: false,
            },
          },
          select: { eventId: true },
        })
        .then((regs) => regs.map((r) => r.eventId)),
      prisma.interestedEvent
        .findMany({
          where: {
            userId: session.user.id,
            event: {
              status: "PUBLISHED",
              isDeleted: false,
            },
          },
          select: { eventId: true },
        })
        .then((items) => items.map((i) => i.eventId)),
    ]);

    // Build where clause
    const whereClause: any = {
      isDeleted: false,
      event: {
        status: "PUBLISHED",
        isDeleted: false, // Only show posts from non-deleted events
        ...(categories.length > 0 && { category: { in: categories } }),
      },
    };

    // Add search filter if provided
    if (search.trim()) {
      whereClause.OR = [
        { content: { contains: search, mode: "insensitive" } },
        {
          event: {
            title: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    // Determine orderBy based on sortBy parameter
    let orderBy: any;

    // For trending, we need posts from last 3 days
    if (sortBy === "trending") {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      whereClause.createdAt = { gte: threeDaysAgo };

      // We'll sort by engagement score (likes + comments count) on the client side
      // For now, get all posts from last 3 days sorted by creation date
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "likes") {
      orderBy = [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
    } else if (sortBy === "comments") {
      orderBy = [{ comments: { _count: "desc" } }, { createdAt: "desc" }];
    } else {
      // Default to recent
      orderBy = { createdAt: "desc" };
    }

    // Get all posts from published events, ordered by specified criteria
    const posts = await prisma.post.findMany({
      where: whereClause,
      skip,
      take,
      orderBy,
      include: {
        author: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
            role: true,
            registrations: {
              select: { status: true, eventId: true },
            },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            creatorId: true,
            isCancelled: true,
            eventManagers: {
              select: {
                userId: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: whereClause,
    });

    // Add event labels to posts
    const postsWithLabels = posts.map((post) => ({
      ...post,
      isUpcomingEvent: upcomingEventIds.includes(post.event.id),
      isInterestedEvent: interestedEventIds.includes(post.event.id),
    }));

    return NextResponse.json({ posts: postsWithLabels, totalCount });
  } catch (error) {
    console.error("Error fetching dashboard posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
