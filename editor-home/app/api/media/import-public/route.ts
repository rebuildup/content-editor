import fs from 'fs';
import path from 'path';
import { saveMedia } from '@/app/lib/media-manager';

export const runtime = 'nodejs';

// ========== GET: publicフォルダの画像一覧を取得 ==========
export async function GET() {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const files = fs.readdirSync(publicDir);

        // 画像ファイルのみフィルタ
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });

        const fileInfos = imageFiles.map(file => {
            const filePath = path.join(publicDir, file);
            const stats = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase();

            let mimeType = 'image/jpeg';
            if (ext === '.png') mimeType = 'image/png';
            if (ext === '.gif') mimeType = 'image/gif';
            if (ext === '.webp') mimeType = 'image/webp';
            if (ext === '.svg') mimeType = 'image/svg+xml';

            return {
                filename: file,
                size: stats.size,
                mimeType,
            };
        });

        return Response.json(fileInfos);
    } catch (error) {
        console.error('GET /api/media/import-public error:', error);
        return Response.json({ error: 'Failed to list public images' }, { status: 500 });
    }
}

// ========== POST: publicフォルダから画像をインポート ==========
export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.contentId || !data.filename) {
            return Response.json({ error: 'contentId and filename are required' }, { status: 400 });
        }

        const publicDir = path.join(process.cwd(), 'public');
        const filePath = path.join(publicDir, data.filename);

        if (!fs.existsSync(filePath)) {
            return Response.json({ error: 'File not found' }, { status: 404 });
        }

        // ファイルを読み込み
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(data.filename).toLowerCase();

        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        if (ext === '.gif') mimeType = 'image/gif';
        if (ext === '.webp') mimeType = 'image/webp';
        if (ext === '.svg') mimeType = 'image/svg+xml';

        const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        saveMedia(data.contentId, {
            id: mediaId,
            filename: data.filename,
            mimeType,
            size: buffer.length,
            alt: data.alt || data.filename,
            description: data.description,
            tags: data.tags,
            data: buffer,
        });

        return Response.json({ ok: true, id: mediaId });
    } catch (error) {
        console.error('POST /api/media/import-public error:', error);
        return Response.json({ error: 'Failed to import image' }, { status: 500 });
    }
}

