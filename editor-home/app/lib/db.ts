import path from "path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "data", "content.db");
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// ========== メインテーブル: contents ==========
db.exec(`
CREATE TABLE IF NOT EXISTS contents (
  -- コア（必須）
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  public_url TEXT,
  
  -- 基本情報
  summary TEXT,
  lang TEXT DEFAULT 'ja',
  
  -- ツリー構造
  parent_id TEXT,
  ancestor_ids TEXT, -- JSON array
  path TEXT,
  depth INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  child_count INTEGER DEFAULT 0,
  
  -- 状態と公開
  visibility TEXT DEFAULT 'draft' CHECK(visibility IN ('public', 'unlisted', 'private', 'draft')),
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  published_at TEXT, -- ISO 8601
  unpublished_at TEXT, -- ISO 8601
  
  -- 検索
  search_full_text TEXT, -- 全文検索用
  search_tokens TEXT, -- JSON array
  
  -- バージョニング
  version INTEGER DEFAULT 1,
  version_latest_id TEXT,
  version_previous_id TEXT,
  version_history_ref TEXT,
  
  -- アクセス制御
  permissions_readers TEXT, -- JSON array
  permissions_editors TEXT, -- JSON array
  permissions_owner TEXT,
  
  -- 複雑なオブジェクト（JSON列）
  thumbnails TEXT, -- JSON: ThumbnailVariants
  searchable TEXT, -- JSON: searchable object
  i18n TEXT, -- JSON: i18n object
  seo TEXT, -- JSON: SEO object
  cache TEXT, -- JSON: cache object
  private_data TEXT, -- JSON: private object
  ext TEXT, -- JSON: extensions
  
  -- タイムスタンプ
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_accessed_at TEXT,
  
  -- 外部キー
  FOREIGN KEY (parent_id) REFERENCES contents(id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_contents_parent ON contents(parent_id);
CREATE INDEX IF NOT EXISTS idx_contents_path ON contents(path);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_visibility ON contents(visibility);
CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at);
CREATE INDEX IF NOT EXISTS idx_contents_lang ON contents(lang);
`);

// ========== タグテーブル ==========
db.exec(`
CREATE TABLE IF NOT EXISTS content_tags (
  content_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (content_id, tag),
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag);
`);

// ========== リレーションテーブル ==========
db.exec(`
CREATE TABLE IF NOT EXISTS content_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL,
  bidirectional INTEGER DEFAULT 0, -- boolean
  weight REAL DEFAULT 1.0,
  meta TEXT, -- JSON
  FOREIGN KEY (source_id) REFERENCES contents(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES contents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_relations_source ON content_relations(source_id);
CREATE INDEX IF NOT EXISTS idx_content_relations_target ON content_relations(target_id);
CREATE INDEX IF NOT EXISTS idx_content_relations_type ON content_relations(type);
`);

// ========== アセットテーブル ==========
db.exec(`
CREATE TABLE IF NOT EXISTS content_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  src TEXT NOT NULL,
  type TEXT, -- MIME type
  width INTEGER,
  height INTEGER,
  alt TEXT,
  meta TEXT, -- JSON
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_assets_content ON content_assets(content_id);
`);

// ========== リンクテーブル ==========
db.exec(`
CREATE TABLE IF NOT EXISTS content_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  href TEXT NOT NULL,
  label TEXT,
  rel TEXT,
  is_primary INTEGER DEFAULT 0, -- boolean
  description TEXT,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_links_content ON content_links(content_id);
`);

// ========== 全文検索テーブル（オプション） ==========
db.exec(`
CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
  id UNINDEXED,
  title,
  summary,
  search_full_text,
  content=contents,
  content_rowid=rowid
);

-- FTS トリガー
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
`);

export default db;