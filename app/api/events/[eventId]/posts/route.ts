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
          select: { name: true, email: true, imageUrl: true },
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
      select: { status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return new NextResponse(
        "Forbidden: Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        { status: 403 }
      );
    }

    // Use all for parallel: Get registration and event status
    const [registration, event] = await Promise.all([
      prisma.registration.findUnique({
        where: { userId_eventId: { userId, eventId } },
        select: { status: true },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
        select: { status: true, title: true },
      }),
    ]);

    if (!event) {
      return new NextResponse("Sự kiện không tồn tại", { status: 404 });
    }

    if (!registration) {
      return new NextResponse(
        "Bạn cần đăng ký sự kiện để tham gia kênh trao đổi.",
        { status: 403 }
      );
    }

    if (registration.status !== "APPROVED") {
      const statusMessages = {
        PENDING:
          "Đăng ký của bạn đang chờ duyệt. Bạn sẽ có thể đăng bài sau khi được quản lý sự kiện duyệt.",
        REJECTED:
          "Đăng ký của bạn đã bị từ chối. Bạn không thể tham gia kênh trao đổi.",
        COMPLETED:
          "Sự kiện đã kết thúc và bạn đã hoàn thành. Kênh trao đổi đã đóng.",
      };

      return new NextResponse(
        `${
          statusMessages[registration.status] || "Bạn không có quyền đăng bài."
        }`,
        { status: 403 }
      );
    }

    if (event.status !== "PUBLISHED") {
      const statusMessages = {
        PENDING_APPROVAL:
          "Sự kiện đang chờ duyệt. Kênh trao đổi sẽ mở sau khi sự kiện được công bố.",
        REJECTED: "Sự kiện đã bị từ chối. Kênh trao đổi không khả dụng.",
      };

      return new NextResponse(
        `Forbidden: ${
          statusMessages[event.status] || "Sự kiện chưa được công bố."
        }`,
        { status: 403 }
      );
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
          select: { name: true, email: true, imageUrl: true },
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
