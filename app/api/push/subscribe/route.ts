// API route to subscribe/unsubscribe from push notifications
// app/api/push/subscribe/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const subscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});

// subscribe
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const validation = subscriptionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid subscription data', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { endpoint, keys } = validation.data;

        const existingSubscription = await prisma.pushSubscription.findUnique({
            where: { endpoint },
        });

        if (existingSubscription) {
            if (existingSubscription.userId !== session.user.id) {
                await prisma.pushSubscription.update({
                    where: { endpoint },
                    data: {
                        userId: session.user.id,
                        p256dh: keys.p256dh,
                        auth: keys.auth,
                    },
                });
            }
        } else {
            await prisma.pushSubscription.create({
                data: {
                    userId: session.user.id,
                    endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Đã đăng ký nhận thông báo thành công'
        });

    } catch (error) {
        console.error('Error subscribing to push:', error);
        return NextResponse.json(
            { error: 'Lỗi khi đăng ký thông báo' },
            { status: 500 }
        );
    }
}

// unsubscribe 
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint is required' },
                { status: 400 }
            );
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                userId: session.user.id,
                endpoint,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Đã hủy đăng ký thông báo'
        });

    } catch (error) {
        console.error('Error unsubscribing from push:', error);
        return NextResponse.json(
            { error: 'Lỗi khi hủy đăng ký thông báo' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: session.user.id },
            select: {
                endpoint: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            subscriptions,
            count: subscriptions.length,
        });

    } catch (error) {
        console.error('Error getting subscriptions:', error);
        return NextResponse.json(
            { error: 'Lỗi khi lấy thông tin đăng ký' },
            { status: 500 }
        );
    }
}