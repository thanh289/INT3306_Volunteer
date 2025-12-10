// API route for updating event post settings
// app/api/events/[eventId]/post-settings/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

type RouteParams = {
  params: Promise<{
    eventId: string;
  }>;
};

const settingsSchema = z.object({
  requirePostApproval: z.boolean(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Get event and check permissions
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        creatorId: true,
        eventManagers: {
          select: { userId: true },
        },
      },
    });

    if (!event) {
      return new NextResponse("Sự kiện không tồn tại", { status: 404 });
    }

    // Check if user is admin, creator, or event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = session.user.id === event.creatorId;
    const isEventManager = event.eventManagers.some(
      (m) => m.userId === session.user.id
    );

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update event settings
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        requirePostApproval: validation.data.requirePostApproval,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("LỖI KHI CẬP NHẬT CÀI ĐẶT:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
