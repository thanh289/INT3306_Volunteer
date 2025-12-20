// API route for deleting a specific event.
// app/api/events/[eventId]/route.ts

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

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if event exists
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

    // Check if already deleted
    if (event.isDeleted) {
      return new NextResponse("Event already deleted", { status: 400 });
    }

    // Check permissions: admin, creator, or assigned event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse(
        "Forbidden - You don't have permission to delete this event",
        { status: 403 }
      );
    }

    // Get list of registered users
    const registrations = await prisma.registration.findMany({
      where: { eventId: eventId },
      select: { userId: true },
    });

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Soft delete the event
      await tx.event.update({
        where: { id: eventId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
          deletedByRole: session.user.role,
        },
      });

      // Create notifications for registered users
      if (registrations.length > 0) {
        const userIds = registrations.map((reg) => reg.userId);
        await tx.notification.createMany({
          data: userIds.map((userId) => ({
            userId: userId,
            message: `Rất tiếc, sự kiện "${event.title}" đã bị hủy bởi người tổ chức.`,
            href: `/events/${eventId}`,
          })),
        });
      }
    });

    // Invalidate event cache
    dataCache.delete(`event:details:${eventId}`);
    dataCache.invalidatePattern(`dashboard:posts:`);
    dataCache.invalidatePattern("homepage:events");

    return NextResponse.json(
      { message: "Sự kiện đã được xóa thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("LỖI KHI XÓA SỰ KIỆN:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

// PATCH endpoint for simple updates like requiresRegistrationForm
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    // Check permissions: admin, creator, or assigned event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();

    // Allow updating requiresRegistrationForm
    if (typeof body.requiresRegistrationForm === "boolean") {
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          requiresRegistrationForm: body.requiresRegistrationForm,
        },
      });

      // Invalidate event cache
      dataCache.delete(`event:details:${eventId}`);
      dataCache.invalidatePattern("homepage:events");

      return NextResponse.json(updatedEvent);
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    console.error("Error updating event settings:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// PUT endpoint for admin to approve/reject events
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admin can approve/reject events
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Admin only", { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !["PUBLISHED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        creatorId: true,
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Update event status
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status },
    });

    // Invalidate caches
    dataCache.delete(`event:details:${eventId}`);
    dataCache.invalidatePattern("homepage:events");

    // Send notification to event creator
    if (status === "PUBLISHED") {
      const { notifyEventPublished } = await import("@/lib/send-notification");
      await notifyEventPublished(event.creatorId, event.title, eventId);
    } else if (status === "REJECTED") {
      const { notifyEventRejected } = await import("@/lib/send-notification");
      await notifyEventRejected(event.creatorId, event.title, eventId);
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event status:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
