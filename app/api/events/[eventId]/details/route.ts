// API route for fetching event details with caching
// app/api/events/[eventId]/details/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { dataCache } from "@/lib/cache";

type RouteParams = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    // Check cache first (5 minute TTL for event details)
    const cacheKey = `event:details:${eventId}`;
    const cachedEvent = dataCache.get<any>(cacheKey);

    if (cachedEvent) {
      // If user is logged in, add registration status
      if (session?.user?.id && !cachedEvent.registration) {
        const registration = await prisma.registration.findUnique({
          where: {
            userId_eventId: { userId: session.user.id, eventId: eventId },
          },
        });
        return NextResponse.json({ ...cachedEvent, registration });
      }
      return NextResponse.json(cachedEvent);
    }

    // Fetch from database
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        eventManagers: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: "APPROVED",
              },
            },
            posts: true,
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if user can access this event
    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    const eventManagerIds = event.eventManagers.map((m) => m.userId);
    const isEventManager = userId ? eventManagerIds.includes(userId) : false;

    // Volunteer cannot access unpublished events
    if (
      event.status !== "PUBLISHED" &&
      userRole !== "ADMIN" &&
      userId !== event.creatorId &&
      !isEventManager
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get registration status if user is logged in
    let registration = null;
    if (userId) {
      registration = await prisma.registration.findUnique({
        where: {
          userId_eventId: { userId, eventId: eventId },
        },
      });
    }

    const result = {
      ...event,
      registration,
      isEventManager,
      canManage:
        userId === event.creatorId || userRole === "ADMIN" || isEventManager,
      isEventEnded: new Date(event.endDateTime) < new Date(),
      isEventStarted: new Date(event.startDateTime) <= new Date(),
    };

    // Cache for 5 minutes (300000ms)
    // Don't cache registration status - that's user-specific
    const { registration: _, ...eventToCache } = result;
    dataCache.set(cacheKey, eventToCache, 300000);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching event details:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
