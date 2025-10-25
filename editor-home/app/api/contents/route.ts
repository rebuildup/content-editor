import {
  addToIndex,
  deleteContentDb,
  getAllFromIndex,
  getContentDb,
  getFromIndex,
} from "@/app/lib/content-db-manager";
import { getFullContent, saveFullContent } from "@/app/lib/content-mapper";
import type { Content } from "@/types/content";

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

// ========== GET: コンテンツ一覧取得 ==========
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 特定のコンテンツを取得
    if (id) {
      const indexData = getFromIndex(id);
      if (!indexData) {
        return Response.json({ error: "Content not found" }, { status: 404 });
      }

      const db = getContentDb(id);
      const fullContent = getFullContent(db, id);
      db.close();

      if (!fullContent) {
        return Response.json({ error: "Content not found" }, { status: 404 });
      }

      return Response.json(fullContent);
    }

    // 全コンテンツの一覧を取得（インデックスから）
    const contents = getAllFromIndex();
    return Response.json(contents);
  } catch (error) {
    console.error("GET /api/contents error:", error);
    return Response.json(
      { error: "Failed to fetch contents" },
      { status: 500 },
    );
  }
}

// ========== POST: コンテンツ作成 ==========
export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.id || !data.title) {
      return Response.json(
        { error: "ID and title are required" },
        { status: 400 },
      );
    }

    const content: Partial<Content> = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      tags: data.tags,
      lang: data.lang || "ja",
      status: data.status || "draft",
      visibility: data.visibility || "draft",
      thumbnails: data.thumbnails,
      assets: data.assets,
      links: data.links,
      seo: data.seo,
      searchable: data.searchable || {
        fullText: `${data.title} ${data.summary || ""} ${(data.tags || []).join(" ")}`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // コンテンツ専用のデータベースを作成・取得
    const db = getContentDb(data.id);

    try {
      // コンテンツデータを保存
      saveFullContent(db, content);

      // インデックスに追加
      if (
        content.id &&
        content.title &&
        content.createdAt &&
        content.updatedAt
      ) {
        addToIndex({
          id: content.id,
          title: content.title,
          summary: content.summary,
          lang: content.lang,
          status: content.status,
          visibility: content.visibility,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
          publishedAt: content.publishedAt,
          tags: content.tags,
          thumbnails: content.thumbnails as Record<string, unknown> | undefined,
          seo: content.seo as Record<string, unknown> | undefined,
        });
      }

      return Response.json({ ok: true, id: content.id });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("POST /api/contents error:", error);
    return Response.json(
      { error: "Failed to create content" },
      { status: 500 },
    );
  }
}

// ========== PUT: コンテンツ更新 ==========
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data.id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    // インデックスで存在確認
    const indexData = getFromIndex(data.id);
    if (!indexData) {
      return Response.json({ error: "Content not found" }, { status: 404 });
    }

    // コンテンツ専用のデータベースを取得
    const db = getContentDb(data.id);

    try {
      // 既存のコンテンツを取得
      const existing = getFullContent(db, data.id);
      if (!existing) {
        return Response.json(
          { error: "Content not found in database" },
          { status: 404 },
        );
      }

      // 更新データをマージ
      const content: Partial<Content> = {
        ...existing,
        ...data,
        id: data.id, // IDは変更不可
        updatedAt: new Date().toISOString(),
        searchable: data.searchable || {
          fullText: `${data.title || existing.title} ${data.summary || existing.summary || ""} ${(data.tags || existing.tags || []).join(" ")}`,
        },
      };

      // コンテンツデータを更新
      saveFullContent(db, content);

      // インデックスを更新
      if (
        content.id &&
        content.title &&
        content.createdAt &&
        content.updatedAt
      ) {
        addToIndex({
          id: content.id,
          title: content.title,
          summary: content.summary,
          lang: content.lang,
          status: content.status,
          visibility: content.visibility,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
          publishedAt: content.publishedAt,
          tags: content.tags,
          thumbnails: content.thumbnails as Record<string, unknown> | undefined,
          seo: content.seo as Record<string, unknown> | undefined,
        });
      }

      return Response.json({ ok: true });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("PUT /api/contents error:", error);
    return Response.json(
      { error: "Failed to update content" },
      { status: 500 },
    );
  }
}

// ========== DELETE: コンテンツ削除 ==========
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    // コンテンツデータベースごと削除
    const success = deleteContentDb(id);

    if (!success) {
      return Response.json({ error: "Content not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/contents error:", error);
    return Response.json(
      { error: "Failed to delete content" },
      { status: 500 },
    );
  }
}
