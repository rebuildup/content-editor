import db from '@/app/lib/db';
import { getFullContent, saveFullContent } from '@/app/lib/content-mapper';
import type { Content } from '@/types/content';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const rows = db.prepare(`
            SELECT 
                id, title, summary, lang, status, visibility,
                published_at, created_at, updated_at,
                thumbnails, seo
            FROM contents
            ORDER BY created_at DESC
        `).all();

        // タグも取得
        const contents = rows.map((row: any) => {
            const tags = db.prepare('SELECT tag FROM content_tags WHERE content_id = ?')
                .all(row.id)
                .map((t: any) => t.tag);

            return {
                id: row.id,
                title: row.title,
                summary: row.summary,
                lang: row.lang,
                status: row.status,
                visibility: row.visibility,
                publishedAt: row.published_at,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                tags: tags.length > 0 ? tags : undefined,
                thumbnails: row.thumbnails ? JSON.parse(row.thumbnails) : undefined,
                seo: row.seo ? JSON.parse(row.seo) : undefined,
            };
        });

        return Response.json(contents);
    } catch (error) {
        console.error('GET /api/contents error:', error);
        return Response.json({ error: 'Failed to fetch contents' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const content: Partial<Content> = {
            id: data.id,
            title: data.title,
            summary: data.summary,
            tags: data.tags,
            lang: data.lang || 'ja',
            status: data.status || 'draft',
            visibility: data.visibility || 'draft',
            thumbnails: data.thumbnails,
            assets: data.assets,
            links: data.links,
            seo: data.seo,
            searchable: data.searchable || {
                fullText: `${data.title} ${data.summary || ''} ${(data.tags || []).join(' ')}`,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        saveFullContent(db, content);

        return Response.json({ ok: true, id: content.id });
    } catch (error) {
        console.error('POST /api/contents error:', error);
        return Response.json({ error: 'Failed to create content' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const data = await req.json();

        // 既存のコンテンツを取得
        const existing = getFullContent(db, data.id);
        if (!existing) {
            return Response.json({ error: 'Content not found' }, { status: 404 });
        }

        // 更新データをマージ
        const content: Partial<Content> = {
            ...existing,
            ...data,
            id: data.id, // IDは変更不可
            updatedAt: new Date().toISOString(),
            searchable: data.searchable || {
                fullText: `${data.title || existing.title} ${data.summary || existing.summary || ''} ${(data.tags || existing.tags || []).join(' ')}`,
            },
        };

        saveFullContent(db, content);

        return Response.json({ ok: true });
    } catch (error) {
        console.error('PUT /api/contents error:', error);
        return Response.json({ error: 'Failed to update content' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return Response.json({ error: 'ID is required' }, { status: 400 });
        }

        // カスケード削除（外部キー制約で自動削除）
        const stmt = db.prepare('DELETE FROM contents WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return Response.json({ error: 'Content not found' }, { status: 404 });
        }

        return Response.json({ ok: true });
    } catch (error) {
        console.error('DELETE /api/contents error:', error);
        return Response.json({ error: 'Failed to delete content' }, { status: 500 });
    }
}