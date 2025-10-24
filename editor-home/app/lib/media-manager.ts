/**
 * メディア（画像）管理機能
 */

import Database from 'better-sqlite3';
import type { MediaItem } from '@/types/media';
import { getContentDb } from './content-db-manager';

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
    }
): void {
    const db = getContentDb(contentId);

    try {
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
            now
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

        const row = stmt.get(mediaId) as any;

        if (!row) return null;

        return {
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
            data: row.data,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
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

        const rows = stmt.all() as any[];

        return rows.map(row => ({
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
        const stmt = db.prepare('DELETE FROM media WHERE id = ?');
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
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM media');
        const sizeStmt = db.prepare('SELECT SUM(size) as total FROM media');
        const typeStmt = db.prepare('SELECT mime_type, COUNT(*) as count FROM media GROUP BY mime_type');

        const countRow = countStmt.get() as { count: number };
        const sizeRow = sizeStmt.get() as { total: number | null };
        const typeRows = typeStmt.all() as Array<{ mime_type: string; count: number }>;

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

