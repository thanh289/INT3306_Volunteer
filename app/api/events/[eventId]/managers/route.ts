// API route for managing event managers
// app/api/events/[eventId]/managers/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Get all event managers for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await params;

    const managers = await prisma.eventManager.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(managers);
  } catch (error) {
    console.error("Error fetching event managers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Add a new event manager
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Check if user is admin or the event creator/existing manager
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventManagers: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isExistingManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isExistingManager) {
      return new NextResponse(
        "Forbidden - You don't have permission to add managers",
        {
          status: 403,
        }
      );
    }

    // Check if user exists and has EVENT_MANAGER or ADMIN role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetUser.role !== "EVENT_MANAGER" && targetUser.role !== "ADMIN") {
      return new NextResponse(
        "User must have EVENT_MANAGER or ADMIN role to be assigned as manager",
        { status: 400 }
      );
    }

    // Check if already a manager
    const existingManager = await prisma.eventManager.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingManager) {
      return new NextResponse("User is already a manager of this event", {
        status: 400,
      });
    }

    // Use transaction to create event manager and registration
    const result = await prisma.$transaction(async (tx) => {
      // Create event manager
      const newManager = await tx.eventManager.create({
        data: {
          userId,
          eventId,
          assignedBy: session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      });

      // Check if user is already registered
      const existingRegistration = await tx.registration.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      // If not registered, create approved registration
      if (!existingRegistration) {
        await tx.registration.create({
          data: {
            userId,
            eventId,
            status: "APPROVED",
          },
        });
      }

      return newManager;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding event manager:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Remove an event manager
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Check if user is admin or the event creator
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;

    if (!isAdmin && !isCreator) {
      return new NextResponse(
        "Forbidden - Only admin or event creator can remove managers",
        { status: 403 }
      );
    }

    // Cannot remove the creator
    if (userId === event.creatorId) {
      return new NextResponse("Cannot remove the event creator from managers", {
        status: 400,
      });
    }

    // Delete event manager
    await prisma.eventManager.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    return new NextResponse("Manager removed successfully", { status: 200 });
  } catch (error) {
    console.error("Error removing event manager:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
