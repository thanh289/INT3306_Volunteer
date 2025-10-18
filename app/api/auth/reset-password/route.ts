// English: API route to handle the final password reset submission.
// src/app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schema to validate the incoming token and new password
const resetSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password } = resetSchema.parse(body);

        // Find the password reset token in the database
        // For now, we are comparing the raw token. (can hash in the future)
        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: {
                token: token,
            },
        });

        // check if token is valid or has expired
        if (!passwordResetToken || new Date(passwordResetToken.expires) < new Date()) {
            return new NextResponse('Token không hợp lệ hoặc đã hết hạn.', { status: 400 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: passwordResetToken.userId },
            data: {
                passwordHash: hashedPassword,
            },
        });

        // Delete the used password reset token
        await prisma.passwordResetToken.delete({
            where: { id: passwordResetToken.id },
        });

        return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công.' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        console.error('LỖI KHI RESET MẬT KHẨU:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}