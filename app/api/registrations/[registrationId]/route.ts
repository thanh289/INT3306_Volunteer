// API route to update a specific registration, e.g., mark as complete.


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { RegistrationStatus } from '@prisma/client';

type RouteParams = {
    params: Promise<{
        registrationId: string;
    }>;
};

const updateSchema = z.object({
    status: z.enum([
        RegistrationStatus.APPROVED,
        RegistrationStatus.REJECTED,
        RegistrationStatus.COMPLETED,
        RegistrationStatus.PENDING,
    ]),
});

export async function PATCH(request: Request, { params }: RouteParams) {
    try {

        const session = await getServerSession(authOptions);
        const { registrationId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }


        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: { event: true },
        });

        if (!registration) {
            return new NextResponse('Registration not found', { status: 404 });
        }

        // Only this manager and admin can update
        if (registration.event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }


        const body = await request.json();
        const { status } = updateSchema.parse(body);


        // manager can mark completed just after the endtime of the event
        if (status === RegistrationStatus.COMPLETED) {
            const eventEndTime = new Date(registration.event.endDateTime);
            const now = new Date();

            if (eventEndTime > now) {
                return new NextResponse('Không thể đánh dấu hoàn thành khi sự kiện chưa kết thúc.', { status: 400 });
            }
        }

        const updatedRegistration = await prisma.registration.update({
            where: { id: registrationId },
            data: { status },
            include: { event: true }
        });

        let message = '';
        switch (status) {
            case 'APPROVED':
                message = `Chúc mừng! Bạn đã được duyệt tham gia sự kiện "${updatedRegistration.event.title}".`;
                break;
            case 'REJECTED':
                message = `Rất tiếc, đăng ký tham gia sự kiện "${updatedRegistration.event.title}" của bạn đã bị từ chối.`;
                break;
            case 'COMPLETED':
                message = `Bạn đã hoàn thành tham gia sự kiện "${updatedRegistration.event.title}". Cảm ơn sự đóng góp của bạn!`;
                break;
        }

        if (message) {
            await prisma.notification.create({
                data: {
                    userId: updatedRegistration.userId,
                    message: message,
                    href: `/events/${updatedRegistration.eventId}`,
                },
            });
        }

        return NextResponse.json(updatedRegistration);
    } catch (error) {
        console.error('LỖI KHI CẬP NHẬT ĐĂNG KÝ:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}