import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// new use registery
export async function POST(request: Request) {
    try {
        // take request from user
        const body = await request.json();
        const { email, name, password } = body;

        // basic checking
        if (!email || !password) {
            return new NextResponse("Email và mật khẩu là bắt buộc", { status: 400 });
        }

        // email exist or not?
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
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