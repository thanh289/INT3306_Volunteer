// API route for an Admin to update a user's status (lock/unlock) or role
// app/api/admin/users/[userId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { UserStatus, Role } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    userId: string;
  }>;
};

const updateSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.LOCKED]).optional(),
  role: z.enum([Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN]).optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.id === userId) {
      return new NextResponse(
        "Không thể tự chỉnh sửa tài khoản của chính mình.",
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    if (!validatedData.status && !validatedData.role) {
      return new NextResponse("Cần cung cấp ít nhất một trường để cập nhật.", {
        status: 400,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("LỖI KHI CẬP NHẬT NGƯỜI DÙNG:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
