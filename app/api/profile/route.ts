// API route for updating the current user's profile.
// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Gender } from "@prisma/client";
import { dataCache } from "@/lib/cache";

// Schema để xác thực dữ liệu gửi lên
const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Tên phải có ít nhất 3 ký tự")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  dateOfBirth: z.coerce.date().optional().or(z.literal("")),
  gender: z.enum([Gender.MALE, Gender.FEMALE]).optional().or(z.literal("")),
});

// GET endpoint to fetch current user's profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check cache first (10 minute TTL for profile data)
    const cacheKey = `profile:${session.user.id}`;
    const cachedProfile = dataCache.get<any>(cacheKey);

    if (cachedProfile) {
      return NextResponse.json(cachedProfile);
    }

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        status: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Cache for 10 minutes (600000ms)
    dataCache.set(cacheKey, user, 600000);

    return NextResponse.json(user);
  } catch (error) {
    console.error("LỖI KHI LẤY HỒ SƠ:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Chỉ update những trường có giá trị thực sự (không rỗng)
    const dataToUpdate: Record<string, unknown> = {};
    if (validatedData.name && validatedData.name.trim() !== "") {
      dataToUpdate.name = validatedData.name;
    }
    if (validatedData.phone && validatedData.phone.trim() !== "") {
      dataToUpdate.phone = validatedData.phone;
    }
    if (validatedData.address && validatedData.address.trim() !== "") {
      dataToUpdate.address = validatedData.address;
    }
    if (validatedData.dateOfBirth) {
      dataToUpdate.dateOfBirth = validatedData.dateOfBirth;
    }
    if (validatedData.gender) {
      dataToUpdate.gender = validatedData.gender;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    // Invalidate profile cache after update
    dataCache.delete(`profile:${session.user.id}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("LỖI KHI CẬP NHẬT HỒ SƠ:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
