// API route for deleting a specific event.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { EventCategory, EventStatus } from '@prisma/client';


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


        // We will notice the volunteer in case the event was deleted
        const registrations = await prisma.registration.findMany({
            where: { eventId: eventId },
            select: { userId: true },
        });

        if (registrations.length > 0) {
            const userIds = registrations.map(reg => reg.userId);
            await prisma.notification.createMany({
                data: userIds.map(userId => ({
                    userId: userId,
                    message: `Rất tiếc, sự kiện "${event.title}" đã bị hủy bởi người tổ chức.`,
                })),
            });
        }

        // Delete all registrations before event
        await prisma.registration.deleteMany({
            where: { eventId: eventId },
        });

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
    status: z.enum(EventStatus).optional(),
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
        const isCreator = event.creatorId === session.user.id;
        const validatedData = updateEventSchema.parse(body);

        // If manager fix the event's information, the status must become pending again and let admin see
        // And to make sure not when the admin want to change the status
        if (event.status === 'PUBLISHED' && isCreator) {
            validatedData.status = 'PENDING_APPROVAL';
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: validatedData,
        });

        if (body.status && session.user.role === 'ADMIN') {
            let message = '';
            if (body.status === 'PUBLISHED') {
                message = `Sự kiện "${updatedEvent.title}" của bạn đã được duyệt và đăng công khai.`;
            } else if (body.status === 'REJECTED') {
                message = `Sự kiện "${updatedEvent.title}" của bạn đã bị từ chối.`;
            }

            if (message) {
                await prisma.notification.create({
                    data: {
                        userId: updatedEvent.creatorId,
                        message: message,
                        href: `/events/${updatedEvent.id}`,
                    },
                });
            }
        }

        return NextResponse.json(updatedEvent);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        console.error('LỖI KHI CẬP NHẬT SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}