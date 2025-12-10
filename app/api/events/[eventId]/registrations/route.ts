// API route to fetch all registrations for a specific event.
// app/api/events/[eventId]/registrations/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
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

    // Check if user is admin, creator, or assigned event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = event.creatorId === session.user.id;
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId: eventId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("LỖI KHI LẤY DANH SÁCH ĐĂNG KÝ:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
