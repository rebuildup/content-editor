import { saveMedia, getMedia, listMedia, deleteMedia } from '@/app/lib/media-manager';
import type { MediaUploadRequest } from '@/types/media';

export const runtime = 'nodejs';

// ========== GET: メディア取得・一覧 ==========
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const contentId = searchParams.get('contentId');
        const mediaId = searchParams.get('id');

        if (!contentId) {
            return Response.json({ error: 'contentId is required' }, { status: 400 });
        }

        // 特定のメディアを取得
        if (mediaId) {
            const media = getMedia(contentId, mediaId);
            if (!media) {
                return Response.json({ error: 'Media not found' }, { status: 404 });
            }

            // バイナリデータをBase64に変換
            const base64 = media.data?.toString('base64');
            return Response.json({
                ...media,
                data: undefined,
                base64,
            });
        }

        // メディア一覧を取得（バイナリデータは含めない）
        const mediaList = listMedia(contentId);
        return Response.json(mediaList);
    } catch (error) {
        console.error('GET /api/media error:', error);
        return Response.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

// ========== POST: メディアアップロード ==========
export async function POST(req: Request) {
    try {
        const data: MediaUploadRequest = await req.json();

        if (!data.contentId || !data.filename || !data.mimeType || !data.base64Data) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Base64をBufferに変換
        const buffer = Buffer.from(data.base64Data, 'base64');

        const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        saveMedia(data.contentId, {
            id: mediaId,
            filename: data.filename,
            mimeType: data.mimeType,
            size: buffer.length,
            alt: data.alt,
            description: data.description,
            tags: data.tags,
            data: buffer,
        });

        return Response.json({ ok: true, id: mediaId });
    } catch (error) {
        console.error('POST /api/media error:', error);
        return Response.json({ error: 'Failed to upload media' }, { status: 500 });
    }
}

// ========== DELETE: メディア削除 ==========
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const contentId = searchParams.get('contentId');
        const mediaId = searchParams.get('id');

        if (!contentId || !mediaId) {
            return Response.json({ error: 'contentId and id are required' }, { status: 400 });
        }

        const success = deleteMedia(contentId, mediaId);
        if (!success) {
            return Response.json({ error: 'Media not found' }, { status: 404 });
        }

        return Response.json({ ok: true });
    } catch (error) {
        console.error('DELETE /api/media error:', error);
        return Response.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}

