import db from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    const rows = db.prepare(`
        SELECT id, title, body_md, created_at
        FROM contents
        ORDER BY created_at DESC
        `).all();
    return Response.json(rows);
}

export async function POST(req: Request) {
    const data = await req.json();

    const stmt = db.prepare(`
        INSERT INTO contents (id,title,body_md,created_at)
        VALUES (@id, @title, @body_md, @created_at)
        `);

    stmt.run({
        id: data.id,
        title: data.title,
        body_md: data.body_md,
        created_at: new Date().toISOString(),

    });

    return Response.json({ ok: true })

}