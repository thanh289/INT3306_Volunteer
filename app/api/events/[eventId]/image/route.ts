// API route for uploading event image
// app/api/events/[eventId]/image/route.ts

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { dataCache } from '@/lib/cache';
import {
    validateImageFile,
    saveAndOptimizeImage,
    deleteImageFile,
    MAX_FILE_SIZES,
    UPLOAD_DIRS
} from '@/lib/upload';

type RouteParams = {
    params: Promise<{
        eventId: string;
    }>;
};

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // check if user is the event creator or admin
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                creatorId: true,
                imageUrl: true
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Sự kiện không tồn tại' },
                { status: 404 }
            );
        }

        if (event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Bạn không có quyền chỉnh sửa sự kiện này' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'Không tìm thấy file ảnh' },
                { status: 400 }
            );
        }

        // Validate file
        const validation = validateImageFile(file, MAX_FILE_SIZES.EVENT);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Save and optimize new image
        const result = await saveAndOptimizeImage(
            file,
            UPLOAD_DIRS.EVENTS,
            {
                maxWidth: 1200,
                maxHeight: 800,
                quality: 85,
            }
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Update event's imageUrl in database
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { imageUrl: result.filename },
            select: {
                id: true,
                title: true,
                imageUrl: true,
            },
        });

        // Delete old image file if exists (after successful update)
        if (event.imageUrl) {
            await deleteImageFile(event.imageUrl);
        }

        // Invalidate caches to force refresh
        dataCache.delete(`event:details:${eventId}`);
        dataCache.invalidatePattern("homepage:events");
        dataCache.invalidatePattern("dashboard:posts:");

        // Revalidate paths to update all pages showing this event
        revalidatePath(`/events/${eventId}`);
        revalidatePath(`/events/${eventId}/edit`);
        revalidatePath('/events');
        revalidatePath('/dashboard');
        revalidatePath('/created-events');
        revalidatePath('/');

        return NextResponse.json({
            success: true,
            imageUrl: updatedEvent.imageUrl,
            event: updatedEvent,
        });

    } catch (error) {
        console.error('Error uploading event image:', error);
        return NextResponse.json(
            { error: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}


export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // if user is the event creator or admin
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                creatorId: true,
                imageUrl: true
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Sự kiện không tồn tại' },
                { status: 404 }
            );
        }

        if (event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Bạn không có quyền chỉnh sửa sự kiện này' },
                { status: 403 }
            );
        }

        if (!event.imageUrl) {
            return NextResponse.json(
                { error: 'Sự kiện không có ảnh để xóa' },
                { status: 400 }
            );
        }

        // remove from database
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { imageUrl: null },
            select: {
                id: true,
                title: true,
                imageUrl: true,
            },
        });

        // Delete file
        await deleteImageFile(event.imageUrl);

        // Invalidate caches to force refresh
        dataCache.delete(`event:details:${eventId}`);
        dataCache.invalidatePattern("homepage:events");
        dataCache.invalidatePattern("dashboard:posts:");

        // Revalidate paths to update all pages showing this event
        revalidatePath(`/events/${eventId}`);
        revalidatePath(`/events/${eventId}/edit`);
        revalidatePath('/events');
        revalidatePath('/dashboard');
        revalidatePath('/created-events');
        revalidatePath('/');

        return NextResponse.json({
            success: true,
            event: updatedEvent,
        });

    } catch (error) {
        console.error('Error deleting event image:', error);
        return NextResponse.json(
            { error: 'Lỗi khi xóa ảnh. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}