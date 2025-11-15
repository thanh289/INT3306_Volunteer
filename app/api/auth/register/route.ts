// API route to handle user registration.
// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from '@/lib/validations/auth';
import { authRateLimiter, withRateLimit } from '@/lib/rate-limit';



// new use registery
export async function POST(request: Request) {
    try {
        // ADDED: Rate limiting for forgot password
        const rateLimitError = await withRateLimit(request, authRateLimiter);
        if (rateLimitError) {
            return rateLimitError;
        }

        // take request from user
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return new NextResponse(result.error.issues[0].message, { status: 400 });
        }

        const { email, name, password } = result.data;
        // prevent duplicate email
        const normalizedEmail = email.toLowerCase().trim();

        // email exist or not?
        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return new NextResponse("Email đã được sử dụng", { status: 409 });
        }

        // encode the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // create new user in the db
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash: hashedPassword,
            },
        });

        // return in4 of the user (not return pw)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        console.error("LỖI KHI ĐĂNG KÝ:", error);
        return new NextResponse("Lỗi hệ thống", { status: 500 });
    }
}