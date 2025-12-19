// API route for updating the current user's profile.
// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Gender } from "@prisma/client";

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
