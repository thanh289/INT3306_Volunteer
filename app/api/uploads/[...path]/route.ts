// API route to serve uploaded files dynamically
// app/api/uploads/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // Get the file path from params
        const { path: pathSegments } = await params;
        const filePath = pathSegments.join('/');
        const fullPath = path.join(process.cwd(), 'uploads', filePath);

        // Check if file exists
        if (!existsSync(fullPath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Read the file
        const fileBuffer = await readFile(fullPath);

        // Determine content type based on file extension
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

        // Return the file with NO CACHE headers
        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });

    } catch (error) {
        console.error('Error serving upload file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
