// API route to check if user is interested in a specific event
// app/api/interested-events/check/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ isInterested: false });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    const interestedEvent = await prisma.interestedEvent.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    return NextResponse.json({ isInterested: !!interestedEvent });
  } catch (error) {
    console.error("LỖI KHI KIỂM TRA SỰ KIỆN QUAN TÂM:", error);
    return NextResponse.json({ isInterested: false });
  }
}
