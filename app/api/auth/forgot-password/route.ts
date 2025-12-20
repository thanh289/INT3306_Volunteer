// API route to handle password reset requests.
// app/api/auth/forgot-password/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { transporter, mailOptions } from "@/lib/nodemailer";
import { createHash, randomBytes } from "crypto";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { strictRateLimiter, withRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // ADDED: Rate limiting for forgot password
    const rateLimitError = await withRateLimit(request, strictRateLimiter);
    if (rateLimitError) {
      return rateLimitError;
    }

    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { email } = result.data;

    // Find the user by their email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, we don't reveal if the user was found or not.
    // we'll send a success response either way.
    if (!user) {
      return NextResponse.json({
        message: "Nếu email tồn tại, link reset sẽ được gửi đến.",
      });
    }

    // generate a secure, random token
    const resetToken = randomBytes(32).toString("hex");

    // hash the token for more security before storing in DB
    const tokenHash = createHash("sha256").update(resetToken).digest("hex");

    // Set an expiration date for the token (like 1 hour from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Store the HASHED token in the database
    // Use upsert to create a new token or update an existing one for this user
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: tokenHash,
        expires,
      },
      create: {
        userId: user.id,
        token: tokenHash,
        expires,
      },
    });

    // send the password reset email (with RAW token)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu cho VolunteerHub",
      html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; font-family: Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f0f9ff;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    
                    <!-- Header with logo and gradient -->
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 48px 32px; text-align: center;">
                        <div style="width: 80px; height: 80px; margin: 0 auto 16px; background-color: white; border-radius: 14.4px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <img src="${process.env.NEXTAUTH_URL}/images/logo.webp" alt="VolunteerHub Logo" style="width: 56px; height: 56px; object-fit: contain;" />
                        </div>
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">VolunteerHub</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Nền tảng kết nối tình nguyện viên</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 48px 40px;">
                        <h2 style="color: #3b82f6; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Yêu cầu đặt lại mật khẩu</h2>
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; font-size: 15px;">
                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                        </p>
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 32px 0; font-size: 15px;">
                        Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu. Link sẽ hết hạn sau <strong style="color: #3b82f6;">1 giờ</strong>.
                        </p>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 14px 40px; text-decoration: none; border-radius: 14.4px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(8, 145, 178, 0.4); transition: all 0.3s ease;">
                                Đặt lại mật khẩu
                            </a>
                        </div>
                        
                        <!-- Security note -->
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 14.4px; margin: 32px 0;">
                            <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.5;">
                                <strong>⚠️ Lưu ý bảo mật:</strong> Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
                            </p>
                        </div>
                        
                        <div style="background-color: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 14.4px; padding: 16px; margin-top: 24px;">
                            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                                Hoặc sao chép link sau vào trình duyệt:
                            </p>
                            <p style="color: #06b6d4; font-size: 13px; margin: 0; word-break: break-all; font-family: 'Courier New', monospace;">
                                ${resetUrl}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f0f9ff; padding: 32px 40px; text-align: center; border-top: 1px solid #e0f2fe;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                            © 2025 VolunteerHub - Nền tảng kết nối tình nguyện viên
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            Email này được gửi tự động, vui lòng không trả lời.
                        </p>
                    </div>
                    
                    </div>
                </body>
                </html>
                `,
    });

    return NextResponse.json({
      message: "Nếu email tồn tại, link reset sẽ được gửi đến.",
    });
  } catch (error) {
    console.error("LỖI KHI YÊU CẦU RESET MẬT KHẨU:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
