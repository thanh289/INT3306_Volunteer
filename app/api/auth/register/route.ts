// API route to handle user registration.
// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { authRateLimiter, withRateLimit } from "@/lib/rate-limit";

// new use registery
export async function POST(request: Request) {
  try {
    const rateLimitError = await withRateLimit(request, authRateLimiter);
    if (rateLimitError) {
      return rateLimitError;
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { email, name, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return new NextResponse("Email đã được sử dụng", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("LỖI KHI ĐĂNG KÝ:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
