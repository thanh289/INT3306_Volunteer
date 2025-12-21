// API route to check if user is interested in a specific event
// app/api/interested-events/check/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { apiCache } from "@/lib/cache";

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

    const cacheKey = `interested:${session.user.id}:${eventId}`;
    const cached = apiCache.get<boolean>(cacheKey);
    if (cached !== null) {
      return NextResponse.json({ isInterested: cached });
    }

    const interestedEvent = await prisma.interestedEvent.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    const isInterested = !!interestedEvent;
    apiCache.set(cacheKey, isInterested);

    return NextResponse.json({ isInterested });
  } catch (error) {
    console.error("LỖI KHI KIỂM TRA SỰ KIỆN QUAN TÂM:", error);
    return NextResponse.json({ isInterested: false });
  }
}
