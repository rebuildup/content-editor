/**
 * メディア（画像）管理機能
 */

import type Database from "better-sqlite3";
import type { MediaRow } from "@/types/database";
import type { MediaItem } from "@/types/media";
import { getContentDb, getFromIndex } from "./content-db-manager";

// ========== メディア保存 ==========

export function saveMedia(
  contentId: string,
  mediaData: {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    description?: string;
    tags?: string[];
    data: Buffer;
  },
): void {
  const db = getContentDb(contentId);

  try {
    ensureContentRow(db, contentId);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO media (
        id, content_id, filename, mime_type, size, width, height, alt, description, tags, data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    stmt.run(
      mediaData.id,
      contentId,
      mediaData.filename,
      mediaData.mimeType,
      mediaData.size,
      mediaData.width || null,
      mediaData.height || null,
      mediaData.alt || null,
      mediaData.description || null,
      mediaData.tags ? JSON.stringify(mediaData.tags) : null,
      mediaData.data,
      now,
      now,
    );
  } finally {
    db.close();
  }
}

// ========== メディア取得 ==========

export function getMedia(contentId: string, mediaId: string): MediaItem | null {
  const db = getContentDb(contentId);

  try {
    const stmt = db.prepare(`
      SELECT id, content_id, filename, mime_type, size, width, height, alt, description, tags, data, created_at, updated_at
      FROM media
      WHERE id = ?
    `);

    const row = stmt.get(mediaId) as MediaRow | undefined;

    if (!row) return null;

    const data = deriveMediaBuffer(row.data);

    return {
      id: row.id,
      contentId: row.content_id,
      filename: row.filename || row.src,
      mimeType: row.mime_type || row.type,
      size: row.size || 0,
      width: row.width,
      height: row.height,
      alt: row.alt,
      description: row.description || "",
      tags: row.tags ? JSON.parse(row.tags) : [],
      data,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  } finally {
    db.close();
  }
}

// ========== メディア一覧取得 ==========

export function listMedia(contentId: string): MediaItem[] {
  const db = getContentDb(contentId);

  try {
    const stmt = db.prepare(`
      SELECT id, content_id, filename, mime_type, size, width, height, alt, description, tags, created_at, updated_at
      FROM media
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as Array<{
      id: string;
      content_id: string;
      filename: string;
      mime_type: string;
      size: number;
      width: number;
      height: number;
      alt: string;
      description: string;
      tags: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      contentId: row.content_id,
      filename: row.filename,
      mimeType: row.mime_type,
      size: row.size,
      width: row.width,
      height: row.height,
      alt: row.alt,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } finally {
    db.close();
  }
}

// ========== メディア削除 ==========

export function deleteMedia(contentId: string, mediaId: string): boolean {
  const db = getContentDb(contentId);

  try {
    const stmt = db.prepare("DELETE FROM media WHERE id = ?");
    const result = stmt.run(mediaId);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

// ========== メディア統計 ==========

export function getMediaStats(contentId: string): {
  totalCount: number;
  totalSize: number;
  byMimeType: Record<string, number>;
} {
  const db = getContentDb(contentId);

  try {
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM media");
    const sizeStmt = db.prepare("SELECT SUM(size) as total FROM media");
    const typeStmt = db.prepare(
      "SELECT mime_type, COUNT(*) as count FROM media GROUP BY mime_type",
    );

    const countRow = countStmt.get() as { count: number };
    const sizeRow = sizeStmt.get() as { total: number | null };
    const typeRows = typeStmt.all() as Array<{
      mime_type: string;
      count: number;
    }>;

    const byMimeType: Record<string, number> = {};
    for (const row of typeRows) {
      byMimeType[row.mime_type] = row.count;
    }

    return {
      totalCount: countRow.count,
      totalSize: sizeRow.total || 0,
      byMimeType,
    };
  } finally {
    db.close();
  }
}

function deriveMediaBuffer(source: MediaRow["data"]): Buffer | undefined {
  if (!source) {
    return undefined;
  }
  if (typeof source === "string") {
    return Buffer.from(source, "base64");
  }
  if (Buffer.isBuffer(source)) {
    return Buffer.from(source);
  }
  return undefined;
}



function ensureContentRow(db: Database.Database, contentId: string) {
  if (!contentId) {
    return;
  }

  const exists = db
    .prepare("SELECT 1 FROM contents WHERE id = ?")
    .get(contentId) as unknown;
  if (exists) {
    return;
  }

  const indexData = getFromIndex(contentId);
  const now = new Date().toISOString();

  const payload = {
    id: contentId,
    title: indexData?.title ?? contentId,
    summary: indexData?.summary ?? null,
    lang: indexData?.lang ?? "ja",
    visibility: indexData?.visibility ?? "draft",
    status: indexData?.status ?? "draft",
    published_at: indexData?.publishedAt ?? null,
    created_at: indexData?.createdAt ?? now,
    updated_at: indexData?.updatedAt ?? now,
  };

  db.prepare(
    `INSERT INTO contents (
      id, title, summary, lang, visibility, status, published_at, created_at, updated_at
    ) VALUES (
      @id, @title, @summary, @lang, @visibility, @status, @published_at, @created_at, @updated_at
    )`,
  ).run(payload);
}

