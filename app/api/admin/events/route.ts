// API route for admin to get all events with filters and pagination
// app/api/admin/events/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Prisma, EventStatus, EventCategory } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const itemsPerPage = 20;

    // Build where clause
    const whereClause: Prisma.EventWhereInput = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      whereClause.status = status as EventStatus;
    }

    if (category && category !== "ALL") {
      whereClause.category = category as EventCategory;
    }

    // Get total count for pagination
    const totalEvents = await prisma.event.count({ where: whereClause });

    // Get events with pagination
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return NextResponse.json({
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / itemsPerPage),
        totalEvents,
        itemsPerPage,
      },
    });
  } catch (error) {
    console.error("LỖI KHI LẤY DANH SÁCH SỰ KIỆN:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
