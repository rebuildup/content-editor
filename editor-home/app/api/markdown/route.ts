// import db from "@/app/lib/db";
import {
  deleteMarkdownPage,
  getMarkdownPage,
  importMarkdownFile,
  type MarkdownPageRow,
  saveMarkdownPage,
} from "@/app/lib/markdown-mapper";
import type { MarkdownFile, MarkdownPage } from "@/types/markdown";

export const runtime = "nodejs";

// ========== OPTIONS: CORS preflight ==========
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// ========== GET: Markdownページ一覧または個別取得 ==========
export async function GET(req: Request) {
  try {
    const db = (await import("@/app/lib/db")).default;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    // 個別取得
    if (id || slug) {
      const page = getMarkdownPage(db, id || slug || "");
      if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404 });
      }
      return Response.json(page);
    }

    // 一覧取得
    const rows = db
      .prepare(`
      SELECT id, slug, frontmatter, lang, status, version, created_at, updated_at, published_at
      FROM markdown_pages
      ORDER BY updated_at DESC
    `)
      .all() as MarkdownPageRow[];

    const pages = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      frontmatter: JSON.parse(row.frontmatter),
      lang: row.lang,
      status: row.status,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
    }));

    return Response.json(pages);
  } catch (error) {
    console.error("GET /api/markdown error:", error);
    return Response.json(
      { error: "Failed to fetch markdown pages" },
      { status: 500 },
    );
  }
}

// ========== POST: 新規Markdownページ作成 ==========
export async function POST(req: Request) {
  try {
    const db = (await import("@/app/lib/db")).default;
    const data = await req.json();

    console.log("POST /api/markdown - Received data:", data);

    // Markdownファイル形式でのインポート
    if (data.file) {
      const file: MarkdownFile = data.file;
      const page = importMarkdownFile(file);
      saveMarkdownPage(db, page);
      return Response.json({ ok: true, id: page.id, slug: page.slug });
    }

    // 直接データで作成
    const page: Partial<MarkdownPage> = {
      id: data.id || `md_${Date.now()}`,
      contentId: data.contentId,
      slug: data.slug,
      frontmatter: data.frontmatter || {},
      body: data.body || "",
      path: data.path,
      lang: data.lang || "ja",
      status: data.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("POST /api/markdown - Page data:", page);

    // スラッグの重複チェック
    if (!page.slug) {
      return Response.json({ error: "Slug is required" }, { status: 400 });
    }
    const existing = getMarkdownPage(db, page.slug);
    if (existing) {
      return Response.json({ error: "Slug already exists" }, { status: 400 });
    }

    console.log("POST /api/markdown - Saving page...");
    saveMarkdownPage(db, page);
    console.log("POST /api/markdown - Page saved successfully");

    // 保存後にIDを取得
    if (!page.slug) {
      return Response.json({ error: "Slug is required" }, { status: 400 });
    }
    const savedPage = getMarkdownPage(db, page.slug);
    if (!savedPage) {
      console.error("POST /api/markdown - Failed to retrieve saved page");
      return Response.json({ error: "Failed to save page" }, { status: 500 });
    }

    console.log("POST /api/markdown - Saved page:", savedPage);
    return Response.json({ ok: true, id: savedPage.id, slug: savedPage.slug });
  } catch (error) {
    console.error("POST /api/markdown error:", error);
    return Response.json(
      { error: "Failed to create markdown page" },
      { status: 500 },
    );
  }
}

// ========== PUT: Markdownページ更新 ==========
export async function PUT(req: Request) {
  try {
    const db = (await import("@/app/lib/db")).default;
    const data = await req.json();

    const existing = getMarkdownPage(db, data.id || data.slug);
    if (!existing) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const page: Partial<MarkdownPage> = {
      ...existing,
      ...data,
      id: existing.id, // IDは変更不可
      updatedAt: new Date().toISOString(),
      version: (existing.version || 1) + 1,
    };

    saveMarkdownPage(db, page);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/markdown error:", error);
    return Response.json(
      { error: "Failed to update markdown page" },
      { status: 500 },
    );
  }
}

// ========== DELETE: Markdownページ削除 ==========
export async function DELETE(req: Request) {
  try {
    const db = (await import("@/app/lib/db")).default;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return Response.json(
        { error: "ID or slug is required" },
        { status: 400 },
      );
    }

    const targetId = id || slug;
    if (!targetId) {
      return Response.json(
        { error: "ID or slug is required" },
        { status: 400 },
      );
    }
    const deleted = deleteMarkdownPage(db, targetId);

    if (!deleted) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/markdown error:", error);
    return Response.json(
      { error: "Failed to delete markdown page" },
      { status: 500 },
    );
  }
}
