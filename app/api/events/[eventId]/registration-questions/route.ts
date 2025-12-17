// API to manage registration questions for an event
// app/api/events/[eventId]/registration-questions/route.ts

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
    const { eventId } = await params;

    const questions = await prisma.registrationQuestion.findMany({
      where: { eventId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        isRequired: true,
        order: true,
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching registration questions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const { question, isRequired, order } = body;

    // Check permissions
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
    const isEventManager = event.eventManagers.length > 0;

    if (!isAdmin && !isCreator && !isEventManager) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create question
    const newQuestion = await prisma.registrationQuestion.create({
      data: {
        eventId,
        question,
        isRequired: isRequired ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating registration question:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
