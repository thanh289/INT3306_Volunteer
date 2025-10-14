//  API route for creating a new event.


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { EventCategory } from '@prisma/client';
import { z } from 'zod';


const createEventSchema = z.object({
    title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
    description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
    location: z.string().min(3, 'Địa điểm phải có ít nhất 3 ký tự'),
    startDateTime: z.coerce.date(),
    endDateTime: z.coerce.date(),
    maxAttendees: z.coerce.number().int().positive('Số người tham gia phải là số dương'),
    category: z.enum(EventCategory),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Check role
        if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'EVENT_MANAGER')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const validatedData = createEventSchema.parse(body);

        const newEvent = await prisma.event.create({
            data: {
                ...validatedData,
                // attach the current id to creatorId
                creatorId: session.user.id,
            },
        });

        return NextResponse.json(newEvent, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        console.error('LỖI KHI TẠO SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}