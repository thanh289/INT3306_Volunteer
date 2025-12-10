// API routes for fetching and creating posts for a specific event.
// app/api/events/[eventId]/posts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod"; // for schema validation

type RouteParams = {
  params: Promise<{
    eventId: string;
  }>;
};

// Get a list of post
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, likes, comments
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");

    // Base query
    const baseQuery = {
      where: { eventId },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            role: true,
            registrations: {
              where: { eventId },
              select: { status: true },
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
    };

    let posts;

    if (sortBy === "likes") {
      // Sort by number of likes (descending)
      posts = await prisma.post.findMany({
        ...baseQuery,
        orderBy: {
          likes: {
            _count: "desc",
          },
        },
      });
    } else if (sortBy === "comments") {
      // Sort by number of comments (descending)
      posts = await prisma.post.findMany({
        ...baseQuery,
        orderBy: {
          comments: {
            _count: "desc",
          },
        },
      });
    } else {
      // Default: sort by recent (createdAt desc)
      posts = await prisma.post.findMany({
        ...baseQuery,
        orderBy: { createdAt: "desc" },
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: { eventId },
    });

    return NextResponse.json({ posts, totalCount });
  } catch (error) {
    console.error("LỖI KHI LẤY BÀI VIẾT:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Nội dung không được để trống")
    .max(500, "Nội dung quá dài"),
});

// Create a post
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;
    const { eventId } = await params;

    // active account
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return new NextResponse(
        "Forbidden: Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        { status: 403 }
      );
    }

    // Get event info
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        status: true,
        title: true,
        creatorId: true,
        eventManagers: {
          select: { userId: true },
        },
      },
    });

    if (!event) {
      return new NextResponse("Sự kiện không tồn tại", { status: 404 });
    }

    // Check if user is admin, creator, or event manager
    const isAdmin = user.role === "ADMIN";
    const isCreator = userId === event.creatorId;
    const isEventManager = event.eventManagers.some((m) => m.userId === userId);
    const isPrivileged = isAdmin || isCreator || isEventManager;

    // Only check event status if user is not privileged
    if (event.status !== "PUBLISHED" && !isPrivileged) {
      return new NextResponse("Forbidden: Sự kiện chưa được công bố.", {
        status: 403,
      });
    }

    const body = await request.json();
    const validationResult = postSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    const newPost = await prisma.post.create({
      data: {
        content,
        eventId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            role: true,
            registrations: {
              where: { eventId },
              select: { status: true },
            },
          },
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("LỖI KHI TẠO BÀI VIẾT:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
