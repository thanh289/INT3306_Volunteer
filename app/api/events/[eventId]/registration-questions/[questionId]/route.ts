// API to update/delete a specific registration question
// app/api/events/[eventId]/registration-questions/[questionId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    eventId: string;
    questionId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId, questionId } = await params;
    const body = await request.json();
    const { question, isRequired } = body;

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

    // Update question
    const updatedQuestion = await prisma.registrationQuestion.update({
      where: { id: questionId },
      data: {
        question,
        isRequired,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating registration question:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId, questionId } = await params;

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

    // Delete question (answers will be cascade deleted)
    await prisma.registrationQuestion.delete({
      where: { id: questionId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting registration question:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
