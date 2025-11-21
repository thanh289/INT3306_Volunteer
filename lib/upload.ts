// Utility functions for file upload handling
// lib/upload.ts

import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export const UPLOAD_DIRS = {
    AVATARS: 'public/uploads/avatars',
    EVENTS: 'public/uploads/events',
};

export const MAX_FILE_SIZES = {
    AVATAR: 2 * 1024 * 1024, // 2MB
    EVENT: 5 * 1024 * 1024,  // 5MB
};

export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];

// Ensure upload directories exist
export async function ensureUploadDirs() {
    for (const dir of Object.values(UPLOAD_DIRS)) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
}

// Validate file
export function validateImageFile(
    file: File,
    maxSize: number
): { valid: boolean; error?: string } {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP)',
        };
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `Kích thước file không được vượt quá ${maxSizeMB}MB`,
        };
    }

    return { valid: true };
}

// Generate unique filename
export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName).toLowerCase();
    return `${prefix}${timestamp}-${randomString}${ext}`;
}

// Save and optimize image
export async function saveAndOptimizeImage(
    file: File,
    directory: string,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    } = {}
): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
        await ensureUploadDirs();

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const filename = generateUniqueFilename(file.name);
        const filepath = path.join(directory, filename);

        // Process image with sharp
        let image = sharp(buffer);

        // Get metadata
        const metadata = await image.metadata();

        // Resize if needed
        if (options.maxWidth || options.maxHeight) {
            image = image.resize({
                width: options.maxWidth,
                height: options.maxHeight,
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        // Optimize based on format
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            image = image.jpeg({ quality: options.quality || 85 });
        } else if (metadata.format === 'png') {
            image = image.png({ quality: options.quality || 85, compressionLevel: 9 });
        } else if (metadata.format === 'webp') {
            image = image.webp({ quality: options.quality || 85 });
        }

        // Save optimized image
        await image.toFile(filepath);

        // Return web-accessible path
        const webPath = filepath.replace('public', '');

        return {
            success: true,
            filename: webPath,
        };
    } catch (error) {
        console.error('Error saving image:', error);
        return {
            success: false,
            error: 'Lỗi khi lưu ảnh. Vui lòng thử lại.',
        };
    }
}

// Delete old image file
export async function deleteImageFile(imagePath: string): Promise<void> {
    try {
        if (!imagePath) return;

        const { unlink } = await import('fs/promises');
        const fullPath = path.join('public', imagePath);

        if (existsSync(fullPath)) {
            await unlink(fullPath);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw error, just log it
    }
}