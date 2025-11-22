// API route to send push notifications (internal use)
// app/api/push/send/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { sendPushNotificationToMany } from '@/lib/push-notifications';
import { z } from 'zod';

const sendPushSchema = z.object({
    userIds: z.array(z.string()).optional(),
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(300),
    url: z.string().optional(),
    tag: z.string().optional(),
});

// push notification to one users
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const validation = sendPushSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { userIds, title, body: message, url, tag } = validation.data;

        // subscriptions for the user
        const subscriptions = await prisma.pushSubscription.findMany({
            where: userIds ? { userId: { in: userIds } } : {},
            select: {
                endpoint: true,
                p256dh: true,
                auth: true,
            },
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No subscriptions found',
                sent: 0,
            });
        }

        const subscriptionsData = subscriptions.map((sub) => ({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        }));

        // send notifications
        const result = await sendPushNotificationToMany(subscriptionsData, {
            title,
            body: message,
            url,
            tag,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
        });

        // delete expired subscriptions
        if (result.expired.length > 0) {
            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: { in: result.expired },
                },
            });
        }

        return NextResponse.json({
            success: true,
            sent: result.sent,
            failed: result.failed,
            expired: result.expired.length,
        });

    } catch (error) {
        console.error('Error sending push notifications:', error);
        return NextResponse.json(
            { error: 'Lỗi khi gửi thông báo' },
            { status: 500 }
        );
    }
}