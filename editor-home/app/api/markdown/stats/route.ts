import { calculateMarkdownStats } from '@/app/lib/markdown-mapper';
import type { MarkdownStats } from '@/types/markdown';

export const runtime = 'nodejs';

// ========== POST: Markdown統計計算 ==========
export async function POST(req: Request) {
    try {
        const { body } = await req.json();

        if (!body) {
            return Response.json({ error: 'Body is required' }, { status: 400 });
        }

        const stats: MarkdownStats = calculateMarkdownStats(body);

        return Response.json(stats);
    } catch (error) {
        console.error('POST /api/markdown/stats error:', error);
        return Response.json({ error: 'Failed to calculate stats' }, { status: 500 });
    }
}

