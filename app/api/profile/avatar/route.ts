// API route for uploading user avatar
// app/api/profile/avatar/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import {
    validateImageFile,
    saveAndOptimizeImage,
    deleteImageFile,
    MAX_FILE_SIZES,
    UPLOAD_DIRS
} from '@/lib/upload';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('avatar') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'Không tìm thấy file ảnh' },
                { status: 400 }
            );
        }

        const validation = validateImageFile(file, MAX_FILE_SIZES.AVATAR);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { imageUrl: true },
        });

        const result = await saveAndOptimizeImage(
            file,
            UPLOAD_DIRS.AVATARS,
            {
                maxWidth: 400,
                maxHeight: 400,
                quality: 90,
            }
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { imageUrl: result.filename },
            select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
            },
        });

        if (currentUser?.imageUrl) {
            await deleteImageFile(currentUser.imageUrl);
        }

        return NextResponse.json({
            success: true,
            imageUrl: updatedUser.imageUrl,
            user: updatedUser,
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        return NextResponse.json(
            { error: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

// DELETE - Remove avatar
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { imageUrl: true },
        });

        if (!currentUser?.imageUrl) {
            return NextResponse.json(
                { error: 'Không có ảnh đại diện để xóa' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { imageUrl: null },
            select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
            },
        });

        await deleteImageFile(currentUser.imageUrl);

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });

    } catch (error) {
        console.error('Error deleting avatar:', error);
        return NextResponse.json(
            { error: 'Lỗi khi xóa ảnh. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}