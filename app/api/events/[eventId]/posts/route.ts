// API routes for fetching and creating posts for a specific event.
// app/api/events/[eventId]/posts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod"; // for schema validation
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

type RouteParams = {
  params: Promise<{
    eventId: string;
  }>;
};

// Get a list of post
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, likes, comments
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");

    // Get event info to check permissions
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        creatorId: true,
        requirePostApproval: true,
        eventManagers: {
          select: { userId: true },
        },
      },
    });

    if (!event) {
      return new NextResponse("Sự kiện không tồn tại", { status: 404 });
    }

    // Check if user is privileged (can see pending posts)
    const isAdmin = session?.user?.role === "ADMIN";
    const isCreator = session?.user?.id === event.creatorId;
    const isEventManager = event.eventManagers.some(
      (m) => m.userId === session?.user?.id
    );
    const canSeePending = isAdmin || isCreator || isEventManager;
    const currentUserId = session?.user?.id;

    // Build where clause for post status
    // Users can see: approved posts, OR their own pending/rejected posts, OR all posts if privileged
    const postStatusFilter = canSeePending
      ? {} // Admins/managers can see all posts
      : {
          OR: [
            { postStatus: "APPROVED" }, // Everyone sees approved posts
            ...(currentUserId
              ? [{ authorId: currentUserId }] // Users see their own posts regardless of status
              : []),
          ],
        };

    // Base query
    const baseQuery = {
      where: {
        eventId,
        isDeleted: false,
        ...postStatusFilter,
      },
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
      // Sort by number of likes (descending), with pinned posts first
      posts = await prisma.post.findMany({
        ...baseQuery,
        orderBy: [
          { isPinned: "desc" }, // Pinned posts first
          {
            likes: {
              _count: "desc",
            },
          },
        ],
      });
    } else if (sortBy === "comments") {
      // Sort by number of comments (descending), with pinned posts first
      posts = await prisma.post.findMany({
        ...baseQuery,
        orderBy: [
          { isPinned: "desc" }, // Pinned posts first
          {
            comments: {
              _count: "desc",
            },
          },
        ],
      });
    } else {
      // Default: sort by recent (createdAt desc), with pinned posts first
      posts = await prisma.post.findMany({
        ...baseQuery,
        orderBy: [
          { isPinned: "desc" }, // Pinned posts first
          { createdAt: "desc" }, // Then by most recent
        ],
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: {
        eventId,
        isDeleted: false,
        ...postStatusFilter,
      },
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
        requirePostApproval: true,
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

    const formData = await request.formData();
    const content = (formData.get("content") as string) || "";
    const imageFile = formData.get("image") as File | null;

    // Validate content - either content or image must be present
    if ((!content || content.trim().length === 0) && !imageFile) {
      return new NextResponse("Bài viết phải có nội dung hoặc ảnh", {
        status: 400,
      });
    }

    if (content && content.length > 500) {
      return new NextResponse("Nội dung quá dài (tối đa 500 ký tự)", {
        status: 400,
      });
    }

    // Handle image upload if present
    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(imageFile.name) || ".jpg";
        const filename = `post-${uniqueSuffix}${ext}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "posts"
        );
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Save file
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        imageUrl = `uploads/posts/${filename}`;
      } catch (error) {
        console.error("Error uploading post image:", error);
        console.error("Image file details:", {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
        });
        return new NextResponse(
          `Không thể tải lên ảnh: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          { status: 500 }
        );
      }
    }

    // Determine post status based on user role and event settings
    let postStatus = "APPROVED"; // Default for admin/creator/manager

    if (!isPrivileged && event.requirePostApproval) {
      postStatus = "PENDING"; // Volunteers need approval if enabled
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        imageUrl,
        eventId,
        authorId: userId,
        postStatus: postStatus as any,
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
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
      return new NextResponse(`Lỗi hệ thống: ${error.message}`, {
        status: 500,
      });
    }
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
