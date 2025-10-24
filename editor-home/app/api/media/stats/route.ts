import { getMediaStats } from '@/app/lib/media-manager';

export const runtime = 'nodejs';

// ========== GET: メディア統計取得 ==========
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const contentId = searchParams.get('contentId');

        if (!contentId) {
            return Response.json({ error: 'contentId is required' }, { status: 400 });
        }

        const stats = getMediaStats(contentId);
        return Response.json(stats);
    } catch (error) {
        console.error('GET /api/media/stats error:', error);
        return Response.json({ error: 'Failed to fetch media stats' }, { status: 500 });
    }
}

