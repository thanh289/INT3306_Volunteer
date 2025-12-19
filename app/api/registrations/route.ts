// API route for a volunteer to fetch their own event registrations.
// app/api/registrations/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 12;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    // Build where clause
    const whereClause: any = {
      userId: session.user.id,
      event: {
        isDeleted: false,
      },
    };

    // If 'all' parameter is set, return all registrations without pagination
    if (all === "true") {
      const registrations = await prisma.registration.findMany({
        where: whereClause,
        include: {
          event: {
            include: {
              creator: true,
            },
          },
        },
        orderBy: {
          event: {
            startDateTime: "asc",
          },
        },
      });

      return NextResponse.json({ registrations });
    }

    // Otherwise, use pagination with filters
    const page = parseInt(searchParams.get("page") || "1");
    const filter = searchParams.get("filter") || "all"; // all, upcoming, past

    // Apply time filter
    if (filter === "upcoming") {
      whereClause.event.endDateTime = { gte: new Date() };
    } else if (filter === "past") {
      whereClause.event.endDateTime = { lt: new Date() };
    }

    // Get total count
    const totalRegistrations = await prisma.registration.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalRegistrations / ITEMS_PER_PAGE);

    // Get paginated registrations
    const registrations = await prisma.registration.findMany({
      where: whereClause,
      include: {
        event: {
          include: {
            creator: true,
          },
        },
      },
      orderBy: {
        event: {
          startDateTime: filter === "past" ? "desc" : "asc",
        },
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    return NextResponse.json({
      registrations,
      pagination: {
        currentPage: page,
        totalPages,
        totalRegistrations,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error("LỖI KHI LẤY SỰ KIỆN ĐÃ ĐĂNG KÝ:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
