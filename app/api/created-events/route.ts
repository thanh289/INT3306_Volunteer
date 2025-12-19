// API route for an event manager to fetch events they created.
// app/api/created-events/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 12;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // API protected: only for EVENT_MANAGER and ADMIN
    if (
      !session ||
      (session.user.role !== "EVENT_MANAGER" && session.user.role !== "ADMIN")
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    // Build where clause
    const whereClause: any = {
      creatorId: session.user.id,
      isDeleted: false,
    };

    // If 'all' parameter is set, return all events without pagination
    if (all === "true") {
      const events = await prisma.event.findMany({
        where: whereClause,
        include: {
          creator: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ events });
    }

    // Otherwise, use pagination with filters
    const page = parseInt(searchParams.get("page") || "1");
    const filter = searchParams.get("filter") || "all"; // all, upcoming, past
    const status = searchParams.get("status") || "all"; // all, published, pending, rejected
    const search = searchParams.get("search") || "";

    // Apply search filter
    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Apply time filter
    if (filter === "upcoming") {
      whereClause.endDateTime = { gte: new Date() };
    } else if (filter === "past") {
      whereClause.endDateTime = { lt: new Date() };
    }

    // Apply status filter
    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    // Get total count
    const totalEvents = await prisma.event.count({ where: whereClause });
    const totalPages = Math.ceil(totalEvents / ITEMS_PER_PAGE);

    // Get paginated events
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    return NextResponse.json({
      events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error("LỖI KHI LẤY SỰ KIỆN ĐÃ TẠO:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
