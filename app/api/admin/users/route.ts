// API route for Admins to fetch all users

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('LỖI KHI LẤY DANH SÁCH NGƯỜI DÙNG:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}