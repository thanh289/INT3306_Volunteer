// API route for cancelling an event (soft cancel with restore option)
// app/api/events/[eventId]/cancel/route.ts

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

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

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

    // Check if already cancelled or deleted
    if (event.isCancelled) {
      return new NextResponse("Event already cancelled", { status: 400 });
    }

    if (event.isDeleted) {
      return new NextResponse("Cannot cancel a deleted event", { status: 400 });
    }

    // Check if event is ongoing (current time is between start and end time)
    const now = new Date();
    const isOngoing = now >= event.startDateTime && now <= event.endDateTime;

    if (isOngoing) {
      return new NextResponse("Không thể hủy sự kiện đang diễn ra", {
        status: 400,
      });
    }

    // Check permissions: admin, creator, or assigned event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse(
        "Forbidden - You don't have permission to cancel this event",
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
      // Cancel the event
      await tx.event.update({
        where: { id: eventId },
        data: {
          isCancelled: true,
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          cancelledByRole: session.user.role,
          cancelReason: reason || "Không có lý do cụ thể",
        },
      });

      // Create notifications for registered users
      if (registrations.length > 0) {
        const userIds = registrations.map((reg) => reg.userId);
        const cancelMessage = reason
          ? `Sự kiện "${event.title}" đã bị hủy. Lý do: ${reason}`
          : `Sự kiện "${event.title}" đã bị hủy bởi người tổ chức.`;

        await tx.notification.createMany({
          data: userIds.map((userId) => ({
            userId: userId,
            message: cancelMessage,
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
      { message: "Sự kiện đã được hủy thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("LỖI KHI HỦY SỰ KIỆN:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
