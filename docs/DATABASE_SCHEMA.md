# データベーススキーマ仕様

このドキュメントは、コンテンツ管理システムのデータベース構造を定義します。

## 概要

- **データベースシステム**: SQLite3
- **管理方式**: コンテンツごとに個別のデータベースファイル
- **ファイル命名規則**: `content-{contentId}.db`
- **保存場所**: `data/contents/`

## データベース構造

各コンテンツデータベースには以下のテーブルが含まれます：

### 1. contents テーブル（メインコンテンツ）

```sql
CREATE TABLE contents (
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
  search_full_text TEXT,
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
  
  FOREIGN KEY (parent_id) REFERENCES contents(id) ON DELETE SET NULL
);
```

**インデックス**:
- `idx_contents_parent`: parent_id
- `idx_contents_path`: path
- `idx_contents_status`: status
- `idx_contents_visibility`: visibility
- `idx_contents_published_at`: published_at
- `idx_contents_created_at`: created_at
- `idx_contents_lang`: lang

### 2. content_tags テーブル（タグ）

```sql
CREATE TABLE content_tags (
  content_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (content_id, tag),
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);
```

**インデックス**:
- `idx_content_tags_tag`: tag

### 3. content_relations テーブル（コンテンツ間の関係）

```sql
CREATE TABLE content_relations (
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
```

**インデックス**:
- `idx_content_relations_source`: source_id
- `idx_content_relations_target`: target_id
- `idx_content_relations_type`: type

### 4. content_assets テーブル（アセット参照）

```sql
CREATE TABLE content_assets (
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
```

**インデックス**:
- `idx_content_assets_content`: content_id

### 5. content_links テーブル（外部リンク）

```sql
CREATE TABLE content_links (
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
```

**インデックス**:
- `idx_content_links_content`: content_id

### 6. markdown_pages テーブル（Markdownページ）

```sql
CREATE TABLE markdown_pages (
  id TEXT PRIMARY KEY,
  content_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  frontmatter TEXT NOT NULL, -- JSON
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
```

**インデックス**:
- `idx_markdown_pages_slug`: slug (UNIQUE)
- `idx_markdown_pages_content`: content_id
- `idx_markdown_pages_path`: path
- `idx_markdown_pages_status`: status
- `idx_markdown_pages_published`: published_at

### 7. media テーブル（画像バイナリ）

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  content_id TEXT,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  description TEXT,
  tags TEXT, -- JSON array
  data BLOB NOT NULL, -- バイナリデータ
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
);
```

**インデックス**:
- `idx_media_content`: content_id
- `idx_media_filename`: filename
- `idx_media_created`: created_at

### 8. 全文検索テーブル（FTS5）

#### contents_fts

```sql
CREATE VIRTUAL TABLE contents_fts USING fts5(
  id UNINDEXED,
  title,
  summary,
  search_full_text,
  content=contents,
  content_rowid=rowid
);
```

#### markdown_pages_fts

```sql
CREATE VIRTUAL TABLE markdown_pages_fts USING fts5(
  id UNINDEXED,
  slug UNINDEXED,
  body,
  content=markdown_pages,
  content_rowid=rowid
);
```

## インデックスデータベース (index.db)

コンテンツ一覧を管理する中央インデックス。

```sql
CREATE TABLE content_index (
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
```

**インデックス**:
- `idx_content_index_status`: status
- `idx_content_index_created`: created_at

## データ型とエンコーディング

### 日付・時刻
- **形式**: ISO 8601 (例: `2025-10-24T22:09:00.000Z`)
- **タイムゾーン**: UTC推奨

### JSON列
JSON形式でシリアライズされたデータを TEXT 型で保存：

```typescript
// 例: thumbnails
{
  "small": { "src": "/thumb-sm.jpg", "width": 100, "height": 100 },
  "medium": { "src": "/thumb-md.jpg", "width": 300, "height": 300 },
  "large": { "src": "/thumb-lg.jpg", "width": 800, "height": 800 }
}

// 例: seo
{
  "metaTitle": "ページタイトル",
  "metaDescription": "ページの説明",
  "ogTitle": "OGタイトル",
  "ogImage": "/og-image.jpg",
  "keywords": ["tag1", "tag2"]
}
```

### BLOB列
画像データなどのバイナリデータを保存：
- `media.data`: 画像のバイナリデータ

## カスケード削除

外部キー制約により、親レコード削除時に関連レコードも自動削除：

- `contents` 削除時:
  - `content_tags` (CASCADE)
  - `content_relations` (CASCADE)
  - `content_assets` (CASCADE)
  - `content_links` (CASCADE)
  - `markdown_pages.content_id` → NULL (SET NULL)
  - `media.content_id` → NULL (SET NULL)

## ファイル構造

```
data/
├── contents/
│   ├── content-apple01.db      # apple01のデータベース
│   ├── content-banana02.db     # banana02のデータベース
│   └── content-orange03.db     # orange03のデータベース
└── index.db                    # 中央インデックス
```

## 移行時の注意点

1. **データベースファイルの移動**: `data/contents/` ディレクトリごと移動
2. **インデックスの再構築**: `index.db` も一緒に移動、または再生成
3. **WALファイル**: `.db-wal` と `.db-shm` ファイルも一緒に移動（存在する場合）
4. **パーミッション**: データベースファイルの読み書き権限を確認

## バックアップ推奨手順

1. 特定コンテンツのバックアップ: `content-{id}.db` をコピー
2. 全体バックアップ: `data/` ディレクトリ全体をコピー
3. 定期バックアップ: cronやスケジューラーで自動化推奨

