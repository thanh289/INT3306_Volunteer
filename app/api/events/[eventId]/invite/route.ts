// API route for sending event invitations
// app/api/events/[eventId]/invite/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/send-notification";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Bạn cần đăng nhập để sử dụng chức năng này!", { status: 401 });
    }

    const { eventId } = await params;
    const { invitedUserId } = await request.json();

    if (!invitedUserId) {
      return new NextResponse("Invited user ID is required", { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { creator: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if user is an event manager or admin
    const isAdmin = session.user.role === "ADMIN";
    const isEventManager = await prisma.eventManager.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    // If not admin or event manager, check if user is registered and approved
    if (!isAdmin && !isEventManager) {
      const userRegistration = await prisma.registration.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId: eventId,
          },
        },
      });

      if (!userRegistration) {
        return new NextResponse(
          "Bạn phải đăng ký sự kiện trước khi mời người khác",
          { status: 403 }
        );
      }

      // Check if registration is approved or completed
      if (
        userRegistration.status !== "APPROVED" &&
        userRegistration.status !== "COMPLETED"
      ) {
        return new NextResponse(
          "Bạn chỉ có thể mời người khác khi đã được duyệt tham gia sự kiện",
          { status: 403 }
        );
      }
    }

    // Check if invited user exists
    const invitedUser = await prisma.user.findUnique({
      where: { id: invitedUserId },
    });

    if (!invitedUser) {
      return new NextResponse("Invited user not found", { status: 404 });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: invitedUserId,
          eventId: eventId,
        },
      },
    });

    if (existingRegistration) {
      return new NextResponse("User is already registered for this event", {
        status: 400,
      });
    }

    // Check if current user has already invited this person
    const existingInvitation = await prisma.eventInvitation.findUnique({
      where: {
        eventId_invitedUserId_invitedBy: {
          eventId: eventId,
          invitedUserId: invitedUserId,
          invitedBy: session.user.id,
        },
      },
    });

    if (existingInvitation) {
      return new NextResponse("Bạn đã mời người này rồi", {
        status: 400,
      });
    }

    // Create invitation
    const invitation = await prisma.eventInvitation.create({
      data: {
        eventId: eventId,
        invitedUserId: invitedUserId,
        invitedBy: session.user.id,
      },
    });

    // Send notification to invited user
    await sendNotification({
      userId: invitedUserId,
      message: `${session.user.name || "Ai đó"} đã mời bạn tham gia sự kiện "${event.title
        }"`,
      href: `/events/${eventId}`,
    });

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error) {
    console.error("LỖI KHI GỬI LỜI MỜI:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Get list of users who can be invited to the event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Bạn cần đăng nhập để sử dụng chức năng này!", { status: 401 });
    }

    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if user is an event manager or admin
    const isAdmin = session.user.role === "ADMIN";
    const isEventManager = await prisma.eventManager.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    // If not admin or event manager, check if user is registered and approved
    if (!isAdmin && !isEventManager) {
      const userRegistration = await prisma.registration.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId: eventId,
          },
        },
      });

      if (!userRegistration) {
        return new NextResponse(
          "Bạn phải đăng ký sự kiện trước khi mời người khác",
          { status: 403 }
        );
      }

      // Check if registration is approved or completed
      if (
        userRegistration.status !== "APPROVED" &&
        userRegistration.status !== "PENDING"
      ) {
        return new NextResponse(
          "Bạn chỉ có thể mời người khác khi đã tham gia sự kiện",
          { status: 403 }
        );
      }
    }

    // Get all registered user IDs
    const registeredUsers = await prisma.registration.findMany({
      where: { eventId: eventId },
      select: { userId: true },
    });
    const registeredUserIds = registeredUsers.map((r) => r.userId);

    // Get user IDs that current user has already invited
    const myInvitations = await prisma.eventInvitation.findMany({
      where: {
        eventId: eventId,
        invitedBy: session.user.id,
      },
      select: { invitedUserId: true },
    });
    const myInvitedUserIds = myInvitations.map((i) => i.invitedUserId);

    // Exclude registered users and current user from search
    const excludedUserIds = [
      ...registeredUserIds,
      session.user.id, // Don't include current user
    ];

    // Get users who are not registered
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedUserIds },
        role: "VOLUNTEER",
        status: "ACTIVE",
        ...(search.trim() && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    // Add flag to indicate if current user has invited each person
    const usersWithInviteStatus = users.map((user) => ({
      ...user,
      alreadyInvitedByMe: myInvitedUserIds.includes(user.id),
    }));

    return NextResponse.json({ users: usersWithInviteStatus });
  } catch (error) {
    console.error("LỖI KHI LẤY DANH SÁCH NGƯỜI DÙNG:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
