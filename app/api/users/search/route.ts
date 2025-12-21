// API route for finding users by email (for event manager assignment)
// app/api/users/search/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      session.user.role !== "EVENT_MANAGER" &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return new NextResponse("Email parameter is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, found: false });
    }

    return NextResponse.json({ user, found: true });
  } catch (error) {
    console.error("Error searching user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
