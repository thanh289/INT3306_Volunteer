// API route to handle password reset requests.

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { transporter, mailOptions } from '@/lib/nodemailer';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const requestSchema = z.object({
    email: z.email('Email không hợp lệ'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = requestSchema.parse(body);

        // Find the user by their email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // For security, we don't reveal if the user was found or not.
        // we'll send a success response either way.
        if (!user) {
            return NextResponse.json({ message: 'Nếu email tồn tại, link reset sẽ được gửi đến.' });
        }

        // generate a secure, random token
        const resetToken = randomBytes(32).toString('hex');
        // const tokenHash = randomBytes(32).toString('hex'); can hash this in the future for more security

        // Set an expiration date for the token (like 1 hour from now)
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        // Store the token in the database
        // Use upsert to create a new token or update an existing one for this user
        await prisma.passwordResetToken.upsert({
            where: { userId: user.id },
            update: {
                token: resetToken,
                expires,
            },
            create: {
                userId: user.id,
                token: resetToken,
                expires,
            },
        });

        // send the password reset email
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            ...mailOptions,
            to: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu cho VolunteerHub',
            html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng nhấn vào link dưới đây để đặt lại mật khẩu của bạn. Link sẽ hết hạn sau 1 giờ.</p>
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
      `,
        });

        return NextResponse.json({ message: 'Nếu email tồn tại, link reset sẽ được gửi đến.' });

    } catch (error) {
        console.error('LỖI KHI YÊU CẦU RESET MẬT KHẨU:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}