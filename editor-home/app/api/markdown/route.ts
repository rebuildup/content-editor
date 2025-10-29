import type Database from "better-sqlite3";
import { getFromIndex } from "@/app/lib/content-db-manager";
import {
  deleteMarkdownPage,
  getMarkdownPage,
  importMarkdownFile,
  type MarkdownPageRow,
  saveMarkdownPage,
} from "@/app/lib/markdown-mapper";
import type {
  MarkdownFile,
  MarkdownFrontmatter,
  MarkdownPage,
} from "@/types/markdown";

export const runtime = "nodejs";

async function getDb(): Promise<Database.Database> {
  const module = await import("@/app/lib/db");
  return module.default as Database.Database;
}

function normalizeFrontmatter(input: unknown): MarkdownFrontmatter {
  if (!input) return {};
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as MarkdownFrontmatter;
    } catch (error) {
      console.warn("Failed to parse frontmatter string:", error);
      return {};
    }
  }
  if (typeof input === "object") {
    return input as MarkdownFrontmatter;
  }
  return {};
}

function ensureContentRecord(
  db: Database.Database,
  contentId: string | undefined,
  fallback?: {
    title?: string;
    summary?: string;
    lang?: string;
    visibility?: string;
    status?: string;
    publishedAt?: string;
  },
): void {
  if (!contentId) return;

  const existing = db
    .prepare("SELECT id FROM contents WHERE id = ?")
    .get(contentId) as { id: string } | undefined;
  if (existing) return;

  const indexData = getFromIndex(contentId);
  const now = new Date().toISOString();
  const payload = {
    id: contentId,
    title: indexData?.title || fallback?.title || contentId,
    summary: indexData?.summary || fallback?.summary || null,
    lang: indexData?.lang || fallback?.lang || "ja",
    visibility: indexData?.visibility || fallback?.visibility || "draft",
    status: indexData?.status || fallback?.status || "draft",
    published_at: indexData?.publishedAt || fallback?.publishedAt || null,
    created_at: indexData?.createdAt || now,
    updated_at: indexData?.updatedAt || now,
  };

  db.prepare(
    `INSERT INTO contents (
      id, title, summary, lang, visibility, status, published_at, created_at, updated_at
    ) VALUES (
      @id, @title, @summary, @lang, @visibility, @status, @published_at, @created_at, @updated_at
    )`,
  ).run(payload);
}

type MarkdownStatus = "draft" | "published" | "archived";
const MARKDOWN_STATUS_SET = new Set<MarkdownStatus>([
  "draft",
  "published",
  "archived",
]);

function normalizeStatus(status: unknown): MarkdownStatus {
  if (typeof status === "string") {
    const normalized = status.trim().toLowerCase();
    if (MARKDOWN_STATUS_SET.has(normalized as MarkdownStatus)) {
      return normalized as MarkdownStatus;
    }
  }
  return "draft";
}

function mapRowToPage(row: MarkdownPageRow): MarkdownPage | null {
  try {
    return {
      id: row.id,
      contentId: row.content_id || undefined,
      slug: row.slug,
      frontmatter: JSON.parse(row.frontmatter),
      body: row.body,
      lang: row.lang,
      status: normalizeStatus(row.status),
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at || undefined,
      path: row.path || undefined,
      htmlCache: row.html_cache || undefined,
    } satisfies MarkdownPage;
  } catch (error) {
    console.error("Failed to parse markdown row:", row.slug, error);
    return null;
  }
}

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

// ========== GET: Markdown�y�[�W�ꗗ�܂��͌ʎ擾 ==========
export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    const slug = searchParams.get("slug")?.trim();
    const contentId = searchParams.get("contentId")?.trim();

    if (id || slug) {
      const page = getMarkdownPage(db, id || slug || "");
      if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404 });
      }
      return Response.json(page, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    let query = `
      SELECT id, content_id, slug, frontmatter, body, lang, status, version, created_at, updated_at, published_at, path, html_cache
      FROM markdown_pages
    `;
    const params: unknown[] = [];
    if (contentId) {
      query += " WHERE content_id = ? ";
      params.push(contentId);
    }
    query += " ORDER BY updated_at DESC";

    const rows = db.prepare(query).all(...params) as MarkdownPageRow[];
    const pages = rows
      .map((row) => mapRowToPage(row))
      .filter((page): page is MarkdownPage => page !== null);

    return Response.json(pages, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("GET /api/markdown error:", error);
    return Response.json(
      { error: "Failed to fetch markdown pages" },
      { status: 500 },
    );
  }
}

// ========== POST: �V�KMarkdown�y�[�W�쐬 ==========
export async function POST(req: Request) {
  try {
    const db = await getDb();
    const data = await req.json();

    // Markdown�t�@�C���`���ł̃C���|�[�g
    if (data.file) {
      const file: MarkdownFile = data.file;
      const page = importMarkdownFile(file);
      const contentId =
        typeof data.contentId === "string" ? data.contentId.trim() : undefined;
      if (contentId) {
        page.contentId = contentId;
      }
      page.status = normalizeStatus(page.status);
      page.lang = page.lang || "ja";

      if (!page.slug) {
        return Response.json({ error: "Slug is required" }, { status: 400 });
      }

      const conflict = db
        .prepare("SELECT id FROM markdown_pages WHERE slug = ?")
        .get(page.slug) as { id: string } | undefined;
      if (conflict) {
        return Response.json({ error: "Slug already exists" }, { status: 400 });
      }

      ensureContentRecord(db, page.contentId, {
        title: page.frontmatter.title,
        summary: page.frontmatter.description,
      });

      saveMarkdownPage(db, page);
      const saved = getMarkdownPage(db, page.id) ?? page;
      return Response.json({
        ok: true,
        id: saved.id,
        slug: saved.slug,
        page: saved,
      });
    }

    const slug = typeof data.slug === "string" ? data.slug.trim() : "";
    if (!slug) {
      return Response.json({ error: "Slug is required" }, { status: 400 });
    }

    const contentId =
      typeof data.contentId === "string" ? data.contentId.trim() : undefined;
    const frontmatter = normalizeFrontmatter(data.frontmatter);
    const now = new Date().toISOString();

    const page: Partial<MarkdownPage> = {
      id: typeof data.id === "string" ? data.id.trim() : undefined,
      contentId,
      slug,
      frontmatter,
      body: typeof data.body === "string" ? data.body : "",
      path: typeof data.path === "string" ? data.path : undefined,
      lang: typeof data.lang === "string" ? data.lang : "ja",
      status: normalizeStatus(data.status),
      createdAt: now,
      updatedAt: now,
    };

    const existingRow = db
      .prepare("SELECT id FROM markdown_pages WHERE slug = ?")
      .get(slug) as { id: string } | undefined;
    if (existingRow) {
      return Response.json({ error: "Slug already exists" }, { status: 400 });
    }

    ensureContentRecord(db, contentId, {
      title: frontmatter.title || slug,
      summary: frontmatter.description,
      lang: page.lang,
      visibility: data.visibility,
      status: page.status,
      publishedAt: frontmatter.date,
    });

    saveMarkdownPage(db, page);
    const savedPage =
      getMarkdownPage(db, slug) ??
      (page.id ? getMarkdownPage(db, page.id) : null);

    return Response.json({
      ok: true,
      id: savedPage?.id || page.id || "",
      slug,
      page: savedPage,
    });
  } catch (error) {
    console.error("POST /api/markdown error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "Failed to create markdown page", details: errorMessage },
      { status: 500 },
    );
  }
}

// ========== PUT: Markdown�y�[�W�X�V ==========
export async function PUT(req: Request) {
  try {
    const db = await getDb();
    const data = await req.json();
    const identifier =
      (typeof data.id === "string" && data.id.trim()) ||
      (typeof data.slug === "string" && data.slug.trim());

    if (!identifier) {
      return Response.json(
        { error: "ID or slug is required" },
        { status: 400 },
      );
    }

    const existing = getMarkdownPage(db, identifier);
    if (!existing) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const nextSlug =
      typeof data.slug === "string"
        ? data.slug.trim() || existing.slug
        : existing.slug;
    if (nextSlug !== existing.slug) {
      const conflict = db
        .prepare("SELECT id FROM markdown_pages WHERE slug = ? AND id != ?")
        .get(nextSlug, existing.id) as { id: string } | undefined;
      if (conflict) {
        return Response.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const contentId =
      (typeof data.contentId === "string" && data.contentId.trim()) ||
      existing.contentId;
    const frontmatter =
      data.frontmatter !== undefined
        ? normalizeFrontmatter(data.frontmatter)
        : existing.frontmatter;

    const status = normalizeStatus(data.status ?? existing.status);

    const page: Partial<MarkdownPage> = {
      ...existing,
      ...data,
      id: existing.id,
      slug: nextSlug,
      contentId,
      frontmatter,
      body: typeof data.body === "string" ? data.body : existing.body,
      status,
      updatedAt: new Date().toISOString(),
      version: (existing.version || 1) + 1,
    };

    ensureContentRecord(db, contentId, {
      title: frontmatter.title || nextSlug,
      summary: frontmatter.description,
      lang: page.lang,
      visibility: page.visibility,
      status,
      publishedAt: frontmatter.date,
    });

    saveMarkdownPage(db, page);
    const savedPage = getMarkdownPage(db, existing.id) ?? page;

    return Response.json({
      ok: true,
      id: existing.id,
      slug: nextSlug,
      page: savedPage,
    });
  } catch (error) {
    console.error("PUT /api/markdown error:", error);
    return Response.json(
      { error: "Failed to update markdown page" },
      { status: 500 },
    );
  }
}

// ========== DELETE: Markdown�y�[�W�폜 ==========
export async function DELETE(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    const slug = searchParams.get("slug")?.trim();

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

    return Response.json({ ok: true, id: targetId });
  } catch (error) {
    console.error("DELETE /api/markdown error:", error);
    return Response.json(
      { error: "Failed to delete markdown page" },
      { status: 500 },
    );
  }
}
