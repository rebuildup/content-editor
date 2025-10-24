/**
 * コンテンツごとの個別データベース管理
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { ContentIndexRow } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_DB_DIR = path.join(DATA_DIR, "contents");
const INDEX_DB_PATH = path.join(DATA_DIR, "index.db");

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(CONTENT_DB_DIR)) {
  fs.mkdirSync(CONTENT_DB_DIR, { recursive: true });
}

// ========== インデックスデータベース（コンテンツの一覧管理） ==========

function getIndexDb(): Database.Database {
  const db = new Database(INDEX_DB_PATH);
  db.pragma("journal_mode = WAL");

  // インデックステーブル作成
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_index (
      id TEXT PRIMARY KEY,
      db_file TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      lang TEXT DEFAULT 'ja',
      status TEXT DEFAULT 'draft',
      visibility TEXT DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,
      tags TEXT, -- JSON array
      thumbnails TEXT, -- JSON
      seo TEXT -- JSON
    );
    
    CREATE INDEX IF NOT EXISTS idx_content_index_status ON content_index(status);
    CREATE INDEX IF NOT EXISTS idx_content_index_created ON content_index(created_at);
  `);

  return db;
}

// ========== コンテンツデータベースのファイル名生成 ==========

export function getContentDbPath(contentId: string): string {
  const sanitizedId = contentId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CONTENT_DB_DIR, `content-${sanitizedId}.db`);
}

// ========== コンテンツデータベースの作成・取得 ==========

export function getContentDb(contentId: string): Database.Database {
  const dbPath = getContentDbPath(contentId);
  const isNewDb = !fs.existsSync(dbPath);

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // 新規データベースの場合はスキーマを作成
  if (isNewDb) {
    initializeContentDbSchema(db);
  }

  return db;
}

// ========== コンテンツデータベースのスキーマ初期化 ==========

function initializeContentDbSchema(db: Database.Database): void {
  // メインテーブル: contents
  db.exec(`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      public_url TEXT,
      summary TEXT,
      lang TEXT DEFAULT 'ja',
      parent_id TEXT,
      ancestor_ids TEXT,
      path TEXT,
      depth INTEGER DEFAULT 0,
      "order" INTEGER DEFAULT 0,
      child_count INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'draft' CHECK(visibility IN ('public', 'unlisted', 'private', 'draft')),
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
      published_at TEXT,
      unpublished_at TEXT,
      search_full_text TEXT,
      search_tokens TEXT,
      version INTEGER DEFAULT 1,
      version_latest_id TEXT,
      version_previous_id TEXT,
      version_history_ref TEXT,
      permissions_readers TEXT,
      permissions_editors TEXT,
      permissions_owner TEXT,
      thumbnails TEXT,
      searchable TEXT,
      i18n TEXT,
      seo TEXT,
      cache TEXT,
      private_data TEXT,
      ext TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_accessed_at TEXT
    );
    
    CREATE TABLE IF NOT EXISTS content_tags (
      content_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (content_id, tag),
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag);
    
    CREATE TABLE IF NOT EXISTS content_relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      bidirectional INTEGER DEFAULT 0,
      weight REAL DEFAULT 1.0,
      meta TEXT,
      FOREIGN KEY (source_id) REFERENCES contents(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES contents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_content_relations_source ON content_relations(source_id);
    CREATE INDEX IF NOT EXISTS idx_content_relations_target ON content_relations(target_id);
    
    CREATE TABLE IF NOT EXISTS content_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id TEXT NOT NULL,
      src TEXT NOT NULL,
      type TEXT,
      width INTEGER,
      height INTEGER,
      alt TEXT,
      meta TEXT,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_content_assets_content ON content_assets(content_id);
    
    CREATE TABLE IF NOT EXISTS content_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id TEXT NOT NULL,
      href TEXT NOT NULL,
      label TEXT,
      rel TEXT,
      is_primary INTEGER DEFAULT 0,
      description TEXT,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_content_links_content ON content_links(content_id);
    
    CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
      id UNINDEXED,
      title,
      summary,
      search_full_text,
      content=contents,
      content_rowid=rowid
    );
    
    CREATE TRIGGER IF NOT EXISTS contents_fts_insert AFTER INSERT ON contents BEGIN
      INSERT INTO contents_fts(rowid, id, title, summary, search_full_text)
      VALUES (new.rowid, new.id, new.title, new.summary, new.search_full_text);
    END;
    
    CREATE TRIGGER IF NOT EXISTS contents_fts_delete AFTER DELETE ON contents BEGIN
      DELETE FROM contents_fts WHERE rowid = old.rowid;
    END;
    
    CREATE TRIGGER IF NOT EXISTS contents_fts_update AFTER UPDATE ON contents BEGIN
      DELETE FROM contents_fts WHERE rowid = old.rowid;
      INSERT INTO contents_fts(rowid, id, title, summary, search_full_text)
      VALUES (new.rowid, new.id, new.title, new.summary, new.search_full_text);
    END;
    
    CREATE TABLE IF NOT EXISTS markdown_pages (
      id TEXT PRIMARY KEY,
      content_id TEXT,
      slug TEXT NOT NULL UNIQUE,
      frontmatter TEXT NOT NULL,
      body TEXT NOT NULL,
      html_cache TEXT,
      path TEXT,
      lang TEXT DEFAULT 'ja',
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
      version INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_markdown_pages_slug ON markdown_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_markdown_pages_content ON markdown_pages(content_id);
    
    CREATE VIRTUAL TABLE IF NOT EXISTS markdown_pages_fts USING fts5(
      id UNINDEXED,
      slug UNINDEXED,
      body,
      content=markdown_pages,
      content_rowid=rowid
    );
    
    CREATE TRIGGER IF NOT EXISTS markdown_pages_fts_insert AFTER INSERT ON markdown_pages BEGIN
      INSERT INTO markdown_pages_fts(rowid, id, slug, body)
      VALUES (new.rowid, new.id, new.slug, new.body);
    END;
    
    CREATE TRIGGER IF NOT EXISTS markdown_pages_fts_delete AFTER DELETE ON markdown_pages BEGIN
      DELETE FROM markdown_pages_fts WHERE rowid = old.rowid;
    END;
    
    CREATE TRIGGER IF NOT EXISTS markdown_pages_fts_update AFTER UPDATE ON markdown_pages BEGIN
      DELETE FROM markdown_pages_fts WHERE rowid = old.rowid;
      INSERT INTO markdown_pages_fts(rowid, id, slug, body)
      VALUES (new.rowid, new.id, new.slug, new.body);
    END;
    
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      content_id TEXT,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      alt TEXT,
      description TEXT,
      tags TEXT,
      data BLOB NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_media_content ON media(content_id);
    CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
  `);
}

// ========== インデックスデータベース操作 ==========

export function addToIndex(contentData: {
  id: string;
  title: string;
  summary?: string;
  lang?: string;
  status?: string;
  visibility?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags?: string[];
  thumbnails?: Record<string, unknown>;
  seo?: Record<string, unknown>;
}): void {
  const indexDb = getIndexDb();
  const dbFile = path.basename(getContentDbPath(contentData.id));

  const stmt = indexDb.prepare(`
    INSERT OR REPLACE INTO content_index 
    (id, db_file, title, summary, lang, status, visibility, created_at, updated_at, published_at, tags, thumbnails, seo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    contentData.id,
    dbFile,
    contentData.title,
    contentData.summary || null,
    contentData.lang || "ja",
    contentData.status || "draft",
    contentData.visibility || "draft",
    contentData.createdAt,
    contentData.updatedAt,
    contentData.publishedAt || null,
    contentData.tags ? JSON.stringify(contentData.tags) : null,
    contentData.thumbnails ? JSON.stringify(contentData.thumbnails) : null,
    contentData.seo ? JSON.stringify(contentData.seo) : null,
  );

  indexDb.close();
}

export function removeFromIndex(contentId: string): void {
  const indexDb = getIndexDb();
  indexDb.prepare("DELETE FROM content_index WHERE id = ?").run(contentId);
  indexDb.close();
}

export function getAllFromIndex(): Array<{
  id: string;
  dbFile: string;
  title: string;
  summary: string;
  lang: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags?: string;
  thumbnails?: string;
  seo?: string;
}> {
  const indexDb = getIndexDb();
  const rows = indexDb
    .prepare("SELECT * FROM content_index ORDER BY created_at DESC")
    .all() as ContentIndexRow[];
  indexDb.close();

  return rows.map((row: ContentIndexRow) => ({
    id: row.id,
    dbFile: row.db_file,
    title: row.title,
    summary: row.summary,
    lang: row.lang,
    status: row.status,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    thumbnails: row.thumbnails ? JSON.parse(row.thumbnails) : undefined,
    seo: row.seo ? JSON.parse(row.seo) : undefined,
  }));
}

export function getFromIndex(contentId: string): {
  id: string;
  dbFile: string;
  title: string;
  summary: string;
  lang: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags?: string;
  thumbnails?: string;
  seo?: string;
} | null {
  const indexDb = getIndexDb();
  const row = indexDb
    .prepare("SELECT * FROM content_index WHERE id = ?")
    .get(contentId) as ContentIndexRow | undefined;
  indexDb.close();

  if (!row) return null;

  return {
    id: row.id,
    dbFile: row.db_file,
    title: row.title,
    summary: row.summary,
    lang: row.lang,
    status: row.status,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    thumbnails: row.thumbnails ? JSON.parse(row.thumbnails) : undefined,
    seo: row.seo ? JSON.parse(row.seo) : undefined,
  };
}

// ========== コンテンツデータベース削除 ==========

export function deleteContentDb(contentId: string): boolean {
  const dbPath = getContentDbPath(contentId);

  if (!fs.existsSync(dbPath)) {
    return false;
  }

  try {
    // データベースファイルとWALファイルを削除
    fs.unlinkSync(dbPath);

    const walPath = `${dbPath}-wal`;
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }

    const shmPath = `${dbPath}-shm`;
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }

    // インデックスから削除
    removeFromIndex(contentId);

    return true;
  } catch (error) {
    console.error("Failed to delete content database:", error);
    return false;
  }
}

// ========== 統計情報 ==========

export function getContentDbStats(): {
  totalContents: number;
  totalDbFiles: number;
  totalSize: number;
  contentsList: Array<{
    id: string;
    title: string;
    dbFile: string;
    size: number;
  }>;
} {
  const indexDb = getIndexDb();
  const allContents = indexDb
    .prepare("SELECT id, title, db_file FROM content_index")
    .all() as ContentIndexRow[];
  indexDb.close();

  let totalSize = 0;
  const contentsList = allContents.map((row: ContentIndexRow) => {
    const dbPath = path.join(CONTENT_DB_DIR, row.db_file);
    let size = 0;

    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      size = stats.size;
      totalSize += size;
    }

    return {
      id: row.id,
      title: row.title,
      dbFile: row.db_file,
      size,
    };
  });

  return {
    totalContents: allContents.length,
    totalDbFiles: contentsList.length,
    totalSize,
    contentsList,
  };
}
