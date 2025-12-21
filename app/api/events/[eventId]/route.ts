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

// for admin to approve/reject events or full event update
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Check if this is an admin approve/reject request
    if (body.status && ["PUBLISHED", "REJECTED"].includes(body.status)) {
      // Only admin can approve/reject events
      if (session.user.role !== "ADMIN") {
        return new NextResponse("Forbidden - Admin only", { status: 403 });
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

      // Get registered users before updating
      const registrations = await prisma.registration.findMany({
        where: { eventId: eventId },
        select: { userId: true },
      });

      // Update event status
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: { status: body.status },
      });

      // Invalidate caches
      dataCache.delete(`event:details:${eventId}`);
      dataCache.invalidatePattern("homepage:events");

      // Send notification to event creator
      if (body.status === "PUBLISHED") {
        const { notifyEventPublished } = await import("@/lib/send-notification");
        await notifyEventPublished(event.creatorId, event.title, eventId);

        // Notify registered users that event is approved again
        if (registrations.length > 0) {
          const userIds = registrations.map((reg) => reg.userId);
          await prisma.notification.createMany({
            data: userIds.map((userId) => ({
              userId: userId,
              message: `Sự kiện "${event.title}" đã được duyệt trở lại và có thể tham gia.`,
              href: `/events/${eventId}`,
            })),
          });
        }
      } else if (body.status === "REJECTED") {
        const { notifyEventRejected } = await import("@/lib/send-notification");
        await notifyEventRejected(event.creatorId, event.title, eventId);

        // Notify registered users and cancel their registrations
        if (registrations.length > 0) {
          const userIds = registrations.map((reg) => reg.userId);

          // Delete all registrations for this event
          await prisma.registration.deleteMany({
            where: { eventId: eventId },
          });

          // Notify users about cancellation
          await prisma.notification.createMany({
            data: userIds.map((userId) => ({
              userId: userId,
              message: `Rất tiếc, sự kiện "${event.title}" đã bị từ chối và đăng ký của bạn đã được hủy.`,
              href: `/events/${eventId}`,
            })),
          });
        }
      }

      return NextResponse.json(updatedEvent);
    }

    // Otherwise, this is a full event update request
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventManagers: {
          where: { userId: session.user.id },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { title, description, location, startDateTime, endDateTime, maxAttendees, category } = body;

    // Validate required fields
    if (!title || !description || !location || !startDateTime || !endDateTime || !maxAttendees || !category) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if there are registered users
    const hasRegistrations = event._count.registrations > 0;

    // Detect important field changes for managers (not admin)
    const importantFieldsChanged = !isAdmin && (
      title !== event.title ||
      location !== event.location ||
      new Date(startDateTime).getTime() !== new Date(event.startDateTime).getTime() ||
      new Date(endDateTime).getTime() !== new Date(event.endDateTime).getTime() ||
      category !== event.category ||
      (parseInt(maxAttendees) < event.maxAttendees) // Giảm số lượng
    );

    // Determine new status
    let newStatus = event.status;
    if (importantFieldsChanged && event.status === "PUBLISHED") {
      // Manager sửa field quan trọng → chuyển về PENDING_APPROVAL
      newStatus = "PENDING_APPROVAL";
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        location,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        maxAttendees: parseInt(maxAttendees),
        category,
        status: newStatus,
      },
    });

    // If status changed to PENDING_APPROVAL and has registrations
    if (newStatus === "PENDING_APPROVAL" && event.status === "PUBLISHED" && hasRegistrations) {
      // Get all registered users
      const registrations = await prisma.registration.findMany({
        where: { eventId: eventId },
        select: { userId: true },
      });

      // Notify registered users about changes
      if (registrations.length > 0) {
        const userIds = registrations.map((reg) => reg.userId);
        await prisma.notification.createMany({
          data: userIds.map((userId) => ({
            userId: userId,
            message: `Sự kiện "${event.title}" đã có thay đổi quan trọng và đang chờ admin duyệt lại.`,
            href: `/events/${eventId}`,
          })),
        });
      }
    } else if (hasRegistrations && (
      title !== event.title ||
      location !== event.location ||
      new Date(startDateTime).getTime() !== new Date(event.startDateTime).getTime() ||
      new Date(endDateTime).getTime() !== new Date(event.endDateTime).getTime()
    )) {
      // Notify users about any significant changes (even if admin edited)
      const registrations = await prisma.registration.findMany({
        where: { eventId: eventId },
        select: { userId: true },
      });

      if (registrations.length > 0) {
        const userIds = registrations.map((reg) => reg.userId);
        const changedFields: string[] = [];
        if (title !== event.title) changedFields.push("tên sự kiện");
        if (location !== event.location) changedFields.push("địa điểm");
        if (new Date(startDateTime).getTime() !== new Date(event.startDateTime).getTime()) changedFields.push("thời gian bắt đầu");
        if (new Date(endDateTime).getTime() !== new Date(event.endDateTime).getTime()) changedFields.push("thời gian kết thúc");

        await prisma.notification.createMany({
          data: userIds.map((userId) => ({
            userId: userId,
            message: `Sự kiện "${title}" đã cập nhật ${changedFields.join(", ")}. Vui lòng xem lại thông tin.`,
            href: `/events/${eventId}`,
          })),
        });
      }
    }

    // Invalidate caches
    dataCache.delete(`event:details:${eventId}`);
    dataCache.invalidatePattern("homepage:events");

    return NextResponse.json({
      ...updatedEvent,
      statusChanged: newStatus !== event.status,
      message: newStatus !== event.status
        ? "Sự kiện đã được cập nhật và chuyển về trạng thái chờ duyệt do có thay đổi quan trọng."
        : "Sự kiện đã được cập nhật thành công."
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}