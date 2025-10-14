// API route for deleting a specific event.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { EventCategory } from '@prisma/client';


type RouteParams = {
    params: Promise<{
        eventId: string;
    }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // validate
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check if event manager or not
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return new NextResponse('Event not found', { status: 404 });
        }

        // only manager and admin can delete
        if (event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        await prisma.event.delete({
            where: { id: eventId },
        });

        return NextResponse.json({ message: 'Sự kiện đã được xóa thành công' }, { status: 200 });
    } catch (error) {
        console.error('LỖI KHI XÓA SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}


const updateEventSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(3).optional(),
    startDateTime: z.coerce.date().optional(),
    endDateTime: z.coerce.date().optional(),
    maxAttendees: z.coerce.number().int().positive().optional(),
    category: z.enum(EventCategory).optional(),
});

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return new NextResponse('Event not found', { status: 404 });
        }
        if (event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const body = await request.json();
        const validatedData = updateEventSchema.parse(body);

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: validatedData, // Truyền dữ liệu đã được xác thực
        });

        return NextResponse.json(updatedEvent);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        console.error('LỖI KHI CẬP NHẬT SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}