// API route for fetching dashboard posts feed
// app/api/dashboard/posts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { dataCache } from "@/lib/cache";

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

    const cacheKey = `dashboard:posts:${session.user.id}:${skip}:${take}:${search}:${categoriesParam}`;

    console.log(`Dashboard API: Attempting to get cache for key: ${cacheKey}`);

    const cachedData = dataCache.get<{ posts: any[]; totalCount: number }>(
      cacheKey
    );
    if (cachedData) {
      console.log("Dashboard posts: Serving from cache", cacheKey);
      return NextResponse.json(cachedData);
    }

    console.log("Dashboard posts: Fetching from database", cacheKey);

    await new Promise((resolve) => setTimeout(resolve, 100));

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

    const whereClause: any = {
      isDeleted: false,
      event: {
        status: "PUBLISHED",
        isDeleted: false,
        ...(categories.length > 0 && { category: { in: categories } }),
      },
    };

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

    const orderBy = { createdAt: "desc" as const };

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

    const deletedPosts = posts.filter((p) => p.isDeleted);
    if (deletedPosts.length > 0) {
      console.log(
        `Dashboard API found ${deletedPosts.length} deleted posts:`,
        deletedPosts.map((p) => ({
          id: p.id,
          isDeleted: p.isDeleted,
          likes: p._count?.likes,
          comments: p._count?.comments,
        }))
      );
    }

    const totalCount = await prisma.post.count({
      where: whereClause,
    });

    const postsWithLabels = posts.map((post) => ({
      ...post,
      isUpcomingEvent: upcomingEventIds.includes(post.event.id),
      isInterestedEvent: interestedEventIds.includes(post.event.id),
    }));

    const result = { posts: postsWithLabels, totalCount };
    dataCache.set(cacheKey, result, 30000);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching dashboard posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
