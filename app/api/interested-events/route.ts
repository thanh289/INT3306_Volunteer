// API route for managing interested events (favorites)
// app/api/interested-events/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 12;

// GET: Fetch all events the user is interested in
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

    // If 'all' parameter is set, return all interested events without pagination
    if (all === "true") {
      const interestedEvents = await prisma.interestedEvent.findMany({
        where: whereClause,
        include: {
          event: {
            include: {
              creator: true,
              _count: {
                select: {
                  registrations: {
                    where: {
                      status: "APPROVED",
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ interestedEvents });
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
    const totalInterestedEvents = await prisma.interestedEvent.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalInterestedEvents / ITEMS_PER_PAGE);

    // Get paginated interested events
    const interestedEvents = await prisma.interestedEvent.findMany({
      where: whereClause,
      include: {
        event: {
          include: {
            creator: true,
            _count: {
              select: {
                registrations: {
                  where: {
                    status: "APPROVED",
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    return NextResponse.json({
      interestedEvents,
      pagination: {
        currentPage: page,
        totalPages,
        totalInterestedEvents,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error("LỖI KHI LẤY SỰ KIỆN QUAN TÂM:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

// POST: Add an event to interested list
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await request.json();

    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if already interested
    const existing = await prisma.interestedEvent.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    if (existing) {
      return new NextResponse("Already interested in this event", {
        status: 400,
      });
    }

    // Add to interested events
    const interestedEvent = await prisma.interestedEvent.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
      },
      include: {
        event: true,
      },
    });

    return NextResponse.json(interestedEvent);
  } catch (error) {
    console.error("LỖI KHI THÊM SỰ KIỆN QUAN TÂM:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

// DELETE: Remove an event from interested list
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    // Check if interested event exists
    const interestedEvent = await prisma.interestedEvent.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    if (!interestedEvent) {
      return new NextResponse("Not interested in this event", {
        status: 404,
      });
    }

    // Delete from interested events
    await prisma.interestedEvent.delete({
      where: {
        id: interestedEvent.id,
      },
    });

    return NextResponse.json({ message: "Removed from interested events" });
  } catch (error) {
    console.error("LỖI KHI XÓA SỰ KIỆN QUAN TÂM:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
