// API to get registration answers
// app/api/registrations/[registrationId]/answers/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    registrationId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { registrationId } = await params;

    // Get registration with event info to check permissions
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            creatorId: true,
            eventManagers: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!registration) {
      return new NextResponse("Registration not found", { status: 404 });
    }

    // Check if user is admin, event creator, or event manager
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = registration.event.creatorId === session.user.id;
    const isManager = registration.event.eventManagers.some(
      (m) => m.userId === session.user.id
    );

    if (!isAdmin && !isCreator && !isManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get answers
    const answers = await prisma.registrationAnswer.findMany({
      where: { registrationId },
      include: {
        question: {
          select: {
            question: true,
          },
        },
      },
      orderBy: {
        question: {
          order: "asc",
        },
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching registration answers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
