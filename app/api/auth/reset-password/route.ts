// API route to handle the final password reset submission.
// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createHash } from 'crypto';
import { resetPasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = resetPasswordSchema.safeParse(body);

        if (!result.success) {
            return new NextResponse(result.error.issues[0].message, { status: 400 });
        }

        const { token, password } = result.data;

        // SECURITY FIX: Hash the token before comparing with database
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Find the password with hashed token in the database
        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: { token: tokenHash },
        });

        // check if token is valid or has expired
        if (!passwordResetToken || new Date(passwordResetToken.expires) < new Date()) {
            return new NextResponse('Token không hợp lệ hoặc đã hết hạn.', { status: 400 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);


        // Use transaction to ensure both operations succeed or fail together
        await prisma.$transaction([
            prisma.user.update({
                where: { id: passwordResetToken.userId },
                data: {
                    passwordHash: hashedPassword,
                },
            }),

            // Delete the used password reset token
            prisma.passwordResetToken.delete({
                where: { id: passwordResetToken.id },
            }),
        ])

        return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công.' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return just the first error message
            return new NextResponse(error.issues[0].message, { status: 400 });
        }
        console.error('LỖI KHI RESET MẬT KHẨU:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}