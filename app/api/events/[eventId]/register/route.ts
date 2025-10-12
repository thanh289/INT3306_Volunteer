// API route to handle a user's registration for a specific event.


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

type PostParams = {
    params: Promise<{
        eventId: string;
    }>;
};

export async function POST(request: Request, { params }: PostParams) {
    try {
        // Make sure user have logged in
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = session.user.id;
        const { eventId } = await params;

        // Check if user have registered this before
        const existingRegistration = await prisma.registration.findUnique({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId,
                },
            },
        });

        if (existingRegistration) {
            return new NextResponse('Bạn đã đăng ký sự kiện này rồi', { status: 409 });
        }

        // Create new resistration in db
        const newRegistration = await prisma.registration.create({
            data: {
                userId: userId,
                eventId: eventId,
            },
        });

        return NextResponse.json(newRegistration, { status: 201 });
    } catch (error) {
        console.error('LỖI KHI ĐĂNG KÝ SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: PostParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = session.user.id;
        const { eventId } = await params;

        // delete from db
        await prisma.registration.delete({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId,
                },
            },
        });

        return NextResponse.json({ message: 'Hủy đăng ký thành công' }, { status: 200 });
    } catch (error) {
        // catch error if user try to delete when haven't registry
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return new NextResponse('Bạn chưa đăng ký sự kiện này', { status: 404 });
        }
        console.error('LỖI KHI HỦY ĐĂNG KÝ:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}