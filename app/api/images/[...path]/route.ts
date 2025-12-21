// API route to serve static images dynamically
// app/api/images/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const filePath = pathSegments.join('/');
        const fullPath = path.join(process.cwd(), 'images', filePath);

        if (!existsSync(fullPath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(fullPath);

        const ext = path.extname(fullPath).toLowerCase();
        const contentTypeMap: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, must-revalidate',
            },
        });

    } catch (error) {
        console.error('Error serving image file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
