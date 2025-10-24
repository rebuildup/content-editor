/**
 * TypeScript型とSQLiteデータベースのマッピング
 */

import type { Content } from "@/types/content";
import type Database from "better-sqlite3";

// ========== データベース行型 ==========
export interface ContentRow {
    // コア
    id: string;
    title: string;
    public_url: string | null;

    // 基本情報
    summary: string | null;
    lang: string;

    // ツリー構造
    parent_id: string | null;
    ancestor_ids: string | null;
    path: string | null;
    depth: number;
    order: number;
    child_count: number;

    // 状態
    visibility: string;
    status: string;
    published_at: string | null;
    unpublished_at: string | null;

    // 検索
    search_full_text: string | null;
    search_tokens: string | null;

    // バージョニング
    version: number;
    version_latest_id: string | null;
    version_previous_id: string | null;
    version_history_ref: string | null;

    // アクセス制御
    permissions_readers: string | null;
    permissions_editors: string | null;
    permissions_owner: string | null;

    // JSON列
    thumbnails: string | null;
    searchable: string | null;
    i18n: string | null;
    seo: string | null;
    cache: string | null;
    private_data: string | null;
    ext: string | null;

    // タイムスタンプ
    created_at: string;
    updated_at: string;
    last_accessed_at: string | null;
}

// ========== Content型 → データベース行 ==========
export function contentToRow(content: Partial<Content>): Partial<ContentRow> {
    const row: Partial<ContentRow> = {
        id: content.id,
        title: content.title,
        public_url: content.publicUrl || null,
        summary: content.summary || null,
        lang: content.lang || 'ja',

        // ツリー構造
        parent_id: content.parentId || null,
        ancestor_ids: content.ancestorIds ? JSON.stringify(content.ancestorIds) : null,
        path: content.path || null,
        depth: content.depth || 0,
        order: content.order || 0,
        child_count: content.childCount || 0,

        // 状態
        visibility: content.visibility || 'draft',
        status: content.status || 'draft',
        published_at: content.publishedAt || null,
        unpublished_at: content.unpublishedAt || null,

        // 検索
        search_full_text: content.searchable?.fullText || null,
        search_tokens: content.searchable?.tokens ? JSON.stringify(content.searchable.tokens) : null,

        // バージョニング
        version: content.version || 1,
        version_latest_id: content.versioning?.latestId || null,
        version_previous_id: content.versioning?.previousId || null,
        version_history_ref: content.versioning?.historyRef || null,

        // アクセス制御
        permissions_readers: content.permissions?.readers ? JSON.stringify(content.permissions.readers) : null,
        permissions_editors: content.permissions?.editors ? JSON.stringify(content.permissions.editors) : null,
        permissions_owner: content.permissions?.owner || null,

        // JSON列
        thumbnails: content.thumbnails ? JSON.stringify(content.thumbnails) : null,
        searchable: content.searchable ? JSON.stringify(content.searchable) : null,
        i18n: content.i18n ? JSON.stringify(content.i18n) : null,
        seo: content.seo ? JSON.stringify(content.seo) : null,
        cache: content.cache ? JSON.stringify(content.cache) : null,
        private_data: content.private ? JSON.stringify(content.private) : null,
        ext: content.ext ? JSON.stringify(content.ext) : null,

        // タイムスタンプ
        created_at: content.createdAt || new Date().toISOString(),
        updated_at: content.updatedAt || new Date().toISOString(),
        last_accessed_at: content.lastAccessedAt || null,
    };

    return row;
}

// ========== データベース行 → Content型 ==========
export function rowToContent(row: ContentRow, tags?: string[], assets?: any[], links?: any[], relations?: any[]): Content {
    const content: Content = {
        // コア
        id: row.id,
        title: row.title,
        publicUrl: row.public_url || undefined,

        // 基本情報
        summary: row.summary || undefined,
        tags: tags || undefined,
        lang: row.lang || undefined,

        // ツリー構造
        parentId: row.parent_id || undefined,
        ancestorIds: row.ancestor_ids ? JSON.parse(row.ancestor_ids) : undefined,
        path: row.path || undefined,
        depth: row.depth || undefined,
        order: row.order || undefined,
        childCount: row.child_count || undefined,

        // 状態
        visibility: row.visibility as any,
        status: row.status as any,
        publishedAt: row.published_at || undefined,
        unpublishedAt: row.unpublished_at || undefined,

        // 検索
        searchable: row.searchable ? JSON.parse(row.searchable) : undefined,

        // バージョニング
        version: row.version || undefined,
        versioning: (row.version_latest_id || row.version_previous_id || row.version_history_ref) ? {
            latestId: row.version_latest_id || undefined,
            previousId: row.version_previous_id || undefined,
            historyRef: row.version_history_ref || undefined,
        } : undefined,

        // アクセス制御
        permissions: (row.permissions_readers || row.permissions_editors || row.permissions_owner) ? {
            readers: row.permissions_readers ? JSON.parse(row.permissions_readers) : undefined,
            editors: row.permissions_editors ? JSON.parse(row.permissions_editors) : undefined,
            owner: row.permissions_owner || undefined,
        } : undefined,

        // JSON列
        thumbnails: row.thumbnails ? JSON.parse(row.thumbnails) : undefined,
        assets: assets || undefined,
        links: links || undefined,
        i18n: row.i18n ? JSON.parse(row.i18n) : undefined,
        seo: row.seo ? JSON.parse(row.seo) : undefined,
        cache: row.cache ? JSON.parse(row.cache) : undefined,
        private: row.private_data ? JSON.parse(row.private_data) : undefined,
        ext: row.ext ? JSON.parse(row.ext) : undefined,

        // リレーション
        relations: relations || undefined,

        // タイムスタンプ
        createdAt: row.created_at || undefined,
        updatedAt: row.updated_at || undefined,
        lastAccessedAt: row.last_accessed_at || undefined,
    };

    return content;
}

// ========== 完全なコンテンツ取得（関連データも含む） ==========
export function getFullContent(db: Database.Database, id: string): Content | null {
    // メインデータ取得
    const row = db.prepare('SELECT * FROM contents WHERE id = ?').get(id) as ContentRow | undefined;
    if (!row) return null;

    // タグ取得
    const tags = db.prepare('SELECT tag FROM content_tags WHERE content_id = ?')
        .all(id)
        .map((r: any) => r.tag);

    // アセット取得
    const assets = db.prepare('SELECT * FROM content_assets WHERE content_id = ? ORDER BY "order"')
        .all(id)
        .map((r: any) => ({
            src: r.src,
            type: r.type,
            width: r.width,
            height: r.height,
            alt: r.alt,
            meta: r.meta ? JSON.parse(r.meta) : undefined,
        }));

    // リンク取得
    const links = db.prepare('SELECT * FROM content_links WHERE content_id = ? ORDER BY "order"')
        .all(id)
        .map((r: any) => ({
            href: r.href,
            label: r.label,
            rel: r.rel,
            primary: r.is_primary === 1,
            description: r.description,
        }));

    // リレーション取得
    const relations = db.prepare('SELECT * FROM content_relations WHERE source_id = ?')
        .all(id)
        .map((r: any) => ({
            targetId: r.target_id,
            type: r.type,
            bidirectional: r.bidirectional === 1,
            weight: r.weight,
            meta: r.meta ? JSON.parse(r.meta) : undefined,
        }));

    return rowToContent(row, tags, assets, links, relations);
}

// ========== コンテンツ保存（関連データも含む） ==========
export function saveFullContent(db: Database.Database, content: Partial<Content>): void {
    try {
        const row = contentToRow(content);

        // メインデータ保存
        const fields = Object.keys(row).filter(k => row[k as keyof typeof row] !== undefined);
        const placeholders = fields.map(f => `@${f}`).join(', ');
        // SQLiteの予約語をエスケープ
        const columns = fields.map(f => f === 'order' ? '"order"' : f).join(', ');

        const stmt = db.prepare(`
      INSERT OR REPLACE INTO contents (${columns})
      VALUES (${placeholders})
    `);
        stmt.run(row);
    } catch (error) {
        console.error('Error saving content:', error);
        console.error('Content data:', JSON.stringify(content, null, 2));
        throw error;
    }

    // タグ保存
    if (content.tags && content.id) {
        db.prepare('DELETE FROM content_tags WHERE content_id = ?').run(content.id);
        const tagStmt = db.prepare('INSERT INTO content_tags (content_id, tag) VALUES (?, ?)');
        for (const tag of content.tags) {
            tagStmt.run(content.id, tag);
        }
    }

    // アセット保存
    if (content.assets && content.id) {
        db.prepare('DELETE FROM content_assets WHERE content_id = ?').run(content.id);
        const assetStmt = db.prepare(`
      INSERT INTO content_assets (content_id, src, type, width, height, alt, meta, "order")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        content.assets.forEach((asset, i) => {
            assetStmt.run(
                content.id,
                asset.src,
                asset.type || null,
                asset.width || null,
                asset.height || null,
                asset.alt || null,
                asset.meta ? JSON.stringify(asset.meta) : null,
                i
            );
        });
    }

    // リンク保存
    if (content.links && content.id) {
        db.prepare('DELETE FROM content_links WHERE content_id = ?').run(content.id);
        const linkStmt = db.prepare(`
      INSERT INTO content_links (content_id, href, label, rel, is_primary, description, "order")
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        content.links.forEach((link, i) => {
            linkStmt.run(
                content.id,
                link.href,
                link.label || null,
                link.rel || null,
                link.primary ? 1 : 0,
                link.description || null,
                i
            );
        });
    }

    // リレーション保存
    if (content.relations && content.id) {
        db.prepare('DELETE FROM content_relations WHERE source_id = ?').run(content.id);
        const relStmt = db.prepare(`
      INSERT INTO content_relations (source_id, target_id, type, bidirectional, weight, meta)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        for (const rel of content.relations) {
            relStmt.run(
                content.id,
                rel.targetId,
                rel.type,
                rel.bidirectional ? 1 : 0,
                rel.weight || 1.0,
                rel.meta ? JSON.stringify(rel.meta) : null
            );
        }
    }
}

