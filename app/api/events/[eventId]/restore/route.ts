// API route for restoring a cancelled event
// app/api/events/[eventId]/restore/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
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

    // Check if event is actually cancelled
    if (!event.isCancelled) {
      return new NextResponse("Event is not cancelled", { status: 400 });
    }

    // Check if deleted
    if (event.isDeleted) {
      return new NextResponse("Cannot restore a deleted event", {
        status: 400,
      });
    }

    // Check permissions: admin, creator, or assigned event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse(
        "Forbidden - You don't have permission to restore this event",
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
      // Restore the event
      await tx.event.update({
        where: { id: eventId },
        data: {
          isCancelled: false,
          cancelledAt: null,
          cancelledBy: null,
          cancelledByRole: null,
          cancelReason: null,
        },
      });

      // Create notifications for registered users
      if (registrations.length > 0) {
        const userIds = registrations.map((reg) => reg.userId);
        await tx.notification.createMany({
          data: userIds.map((userId) => ({
            userId: userId,
            message: `Tin tốt! Sự kiện "${event.title}" đã được khôi phục và sẽ diễn ra như kế hoạch.`,
            href: `/events/${eventId}`,
          })),
        });
      }
    });

    return NextResponse.json(
      { message: "Sự kiện đã được khôi phục thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("LỖI KHI KHÔI PHỤC SỰ KIỆN:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
