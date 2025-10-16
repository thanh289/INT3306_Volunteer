// API route for an event manager to fetch events they created.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Bảo vệ API: Chỉ EVENT_MANAGER và ADMIN mới có quyền truy cập
        if (!session || (session.user.role !== 'EVENT_MANAGER' && session.user.role !== 'ADMIN')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const events = await prisma.event.findMany({
            where: {
                creatorId: session.user.id,
            },
            include: {
                creator: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('LỖI KHI LẤY SỰ KIỆN ĐÃ TẠO:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}