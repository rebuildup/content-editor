# データ構造

## 概要

page-editorのデータ構造は、既存のeditor-homeとmd-editorのデータ構造を継承し、ブロックシステムに対応した拡張を行います。

## 基本データ型

### 1. コンテンツ管理

#### ContentIndexItem
```typescript
interface ContentIndexItem {
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
}
```

#### Content（拡張版）
```typescript
interface Content extends ContentIndexItem {
  // 基本情報
  thumbnails?: Record<string, unknown>;
  assets?: Record<string, unknown>;
  links?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  
  // 検索用
  searchable?: {
    fullText: string;
  };
  
  // ブロックシステム用拡張
  blockSettings?: {
    defaultTheme?: string;
    enableComments?: boolean;
    allowCollaboration?: boolean;
  };
}
```

### 2. マークダウンページ

#### MarkdownPage
```typescript
interface MarkdownPage {
  id: string;
  contentId?: string;
  slug: string;
  frontmatter: MarkdownFrontmatter;
  body: string;
  htmlCache?: string;
  path?: string;
  lang?: string;
  status?: "draft" | "published" | "archived";
  version?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

#### MarkdownFrontmatter
```typescript
interface MarkdownFrontmatter {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  category?: string;
  date?: string;
  updated?: string;
  draft?: boolean;
  slug?: string;
  coverImage?: string;
  toc?: boolean;
  
  // ブロックシステム用拡張
  blockConfig?: {
    enableTableOfContents?: boolean;
    defaultCodeLanguage?: string;
    mathRendering?: boolean;
  };
  
  [key: string]: unknown;
}
```

### 3. メディア管理

#### MediaItem
```typescript
interface MediaItem {
  id: string;
  contentId?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  data?: Buffer;
  base64?: string;
  
  // ブロックシステム用拡張
  blockMetadata?: {
    thumbnail?: string;
    duration?: number; // 動画・音声用
    aspectRatio?: number; // 画像用
    quality?: string; // 画質情報
  };
}
```

## ブロックシステムデータ型

### 1. 基本ブロック型

#### BlockBase
```typescript
interface BlockBase {
  id: string;
  type: string;
  content: string;
  attributes?: Record<string, unknown>;
  children?: BlockBase[];
  meta?: {
    order: number;
    depth: number;
    parent?: string;
  };
}
```

#### TextBlock
```typescript
interface TextBlock extends BlockBase {
  type: "text";
  content: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
}
```

#### HeadingBlock
```typescript
interface HeadingBlock extends BlockBase {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  anchor?: string; // 目次用アンカー
}
```

#### ListBlock
```typescript
interface ListBlock extends BlockBase {
  type: "list";
  listType: "bullet" | "ordered" | "checklist";
  items: ListItem[];
}

interface ListItem {
  id: string;
  content: string;
  checked?: boolean; // チェックリスト用
  children?: ListItem[];
}
```

### 2. メディアブロック型

#### ImageBlock
```typescript
interface ImageBlock extends BlockBase {
  type: "image";
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  lazy?: boolean;
  attributes?: {
    alignment?: "left" | "center" | "right";
    border?: boolean;
    shadow?: boolean;
  };
}
```

#### VideoBlock
```typescript
interface VideoBlock extends BlockBase {
  type: "video";
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  attributes?: {
    quality?: "auto" | "720p" | "1080p";
    subtitles?: string[];
  };
}
```

#### AudioBlock
```typescript
interface AudioBlock extends BlockBase {
  type: "audio";
  src: string;
  title?: string;
  duration?: string;
  attributes?: {
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    preload?: "none" | "metadata" | "auto";
  };
}
```

### 3. 応用ブロック型

#### CalloutBlock
```typescript
interface CalloutBlock extends BlockBase {
  type: "callout";
  calloutType: "info" | "warning" | "error" | "success" | "note";
  icon?: string;
  title?: string;
  content: string;
  attributes?: {
    collapsible?: boolean;
    defaultOpen?: boolean;
  };
}
```

#### CodeBlock
```typescript
interface CodeBlock extends BlockBase {
  type: "code";
  language: string;
  code: string;
  filename?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
  attributes?: {
    theme?: string;
    fontSize?: number;
    wrapLines?: boolean;
  };
}
```

#### MathBlock
```typescript
interface MathBlock extends BlockBase {
  type: "math";
  mathType: "inline" | "block";
  formula: string;
  attributes?: {
    renderMode?: "mathml" | "html" | "svg";
    throwOnError?: boolean;
  };
}
```

#### TableOfContentsBlock
```typescript
interface TableOfContentsBlock extends BlockBase {
  type: "toc";
  maxDepth?: number;
  includePageNumbers?: boolean;
  attributes?: {
    style?: "simple" | "detailed" | "compact";
    showBackToTop?: boolean;
  };
}
```

### 4. データベースブロック型

#### TableBlock
```typescript
interface TableBlock extends BlockBase {
  type: "table";
  headers: string[];
  rows: TableRow[];
  attributes?: {
    sortable?: boolean;
    filterable?: boolean;
    pagination?: boolean;
    pageSize?: number;
  };
}

interface TableRow {
  id: string;
  cells: TableCell[];
}

interface TableCell {
  content: string;
  type?: "text" | "number" | "date" | "boolean";
  align?: "left" | "center" | "right";
}
```

#### BoardBlock
```typescript
interface BoardBlock extends BlockBase {
  type: "board";
  columns: BoardColumn[];
  attributes?: {
    cardSize?: "small" | "medium" | "large";
    showLabels?: boolean;
  };
}

interface BoardColumn {
  id: string;
  title: string;
  cards: BoardCard[];
}

interface BoardCard {
  id: string;
  title: string;
  content?: string;
  labels?: string[];
  assignee?: string;
  dueDate?: string;
}
```

### 5. 埋め込みブロック型

#### EmbedBlock
```typescript
interface EmbedBlock extends BlockBase {
  type: "embed";
  embedType: "youtube" | "googlemap" | "twitter" | "custom";
  url: string;
  attributes?: Record<string, unknown>;
}

interface YouTubeEmbed extends EmbedBlock {
  embedType: "youtube";
  videoId: string;
  attributes?: {
    startTime?: number;
    endTime?: number;
    showControls?: boolean;
  };
}

interface GoogleMapEmbed extends EmbedBlock {
  embedType: "googlemap";
  address: string;
  attributes?: {
    zoom?: number;
    mapType?: "roadmap" | "satellite" | "hybrid" | "terrain";
  };
}
```

## エディター状態管理

### 1. エディター状態

#### EditorState
```typescript
interface EditorState {
  // 現在のページ情報
  currentPage?: MarkdownPage;
  currentContentId?: string;
  
  // エディター状態
  markdown: string;
  cursorPosition: {
    line: number;
    column: number;
  };
  
  // プレビュー状態
  previewMode: "split" | "editor" | "preview";
  previewContent?: ReactNode;
  
  // 選択状態
  selectedBlocks: string[];
  
  // UI状態
  sidebarOpen: boolean;
  activePanel: "content" | "media" | "blocks";
  
  // 保存状態
  isSaving: boolean;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
}
```

### 2. ブロック状態

#### BlockState
```typescript
interface BlockState {
  blocks: Map<string, BlockBase>;
  blockOrder: string[];
  activeBlock?: string;
  hoveredBlock?: string;
  
  // ブロック操作
  clipboard?: BlockBase[];
}
```

### 3. メディア状態

#### MediaState
```typescript
interface MediaState {
  mediaItems: MediaItem[];
  selectedMedia?: string;
  uploadProgress?: Map<string, number>;
  
  // フィルタ・ソート
  filter?: {
    type?: string;
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  sortBy?: "name" | "date" | "size" | "type";
  sortOrder?: "asc" | "desc";
}
```

## API データ型

### 1. リクエスト型

#### CreatePageRequest
```typescript
interface CreatePageRequest {
  contentId?: string;
  slug: string;
  frontmatter?: MarkdownFrontmatter;
  body?: string;
  path?: string;
  lang?: string;
  status?: "draft" | "published" | "archived";
}
```

#### UpdatePageRequest
```typescript
interface UpdatePageRequest {
  id: string;
  slug?: string;
  frontmatter?: MarkdownFrontmatter;
  body?: string;
  status?: "draft" | "published" | "archived";
}
```

#### UploadMediaRequest
```typescript
interface UploadMediaRequest {
  contentId?: string;
  filename: string;
  mimeType: string;
  base64Data: string;
  alt?: string;
  description?: string;
  tags?: string[];
}
```

### 2. レスポンス型

#### APIResponse
```typescript
interface APIResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

#### PageResponse
```typescript
interface PageResponse {
  ok: boolean;
  id: string;
  slug: string;
  page?: MarkdownPage;
}
```

#### MediaResponse
```typescript
interface MediaResponse {
  ok: boolean;
  id: string;
  url?: string;
}
```

## データベーススキーマ

### 1. テーブル構造

#### contents テーブル
```sql
CREATE TABLE contents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  lang TEXT DEFAULT 'ja',
  visibility TEXT DEFAULT 'draft',
  status TEXT DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### markdown_pages テーブル
```sql
CREATE TABLE markdown_pages (
  id TEXT PRIMARY KEY,
  content_id TEXT,
  slug TEXT UNIQUE NOT NULL,
  frontmatter TEXT NOT NULL,
  body TEXT NOT NULL,
  lang TEXT DEFAULT 'ja',
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  path TEXT,
  html_cache TEXT,
  FOREIGN KEY (content_id) REFERENCES contents(id)
);
```

#### media_items テーブル
```sql
CREATE TABLE media_items (
  id TEXT PRIMARY KEY,
  content_id TEXT,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  description TEXT,
  tags TEXT, -- JSON配列
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (content_id) REFERENCES contents(id)
);
```

### 2. インデックス

```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at);
CREATE INDEX idx_markdown_pages_content_id ON markdown_pages(content_id);
CREATE INDEX idx_markdown_pages_slug ON markdown_pages(slug);
CREATE INDEX idx_markdown_pages_status ON markdown_pages(status);
CREATE INDEX idx_media_items_content_id ON media_items(content_id);
CREATE INDEX idx_media_items_mime_type ON media_items(mime_type);
```

## データ変換

### 1. Markdown ↔ ブロック変換

#### MarkdownToBlocks
```typescript
interface MarkdownToBlocksOptions {
  preserveWhitespace?: boolean;
  enableBlockTags?: boolean;
  customBlockParsers?: Map<string, BlockParser>;
}

function markdownToBlocks(
  markdown: string,
  options?: MarkdownToBlocksOptions
): BlockBase[];
```

#### BlocksToMarkdown
```typescript
interface BlocksToMarkdownOptions {
  includeFrontmatter?: boolean;
  formatCode?: boolean;
  escapeHtml?: boolean;
}

function blocksToMarkdown(
  blocks: BlockBase[],
  options?: BlocksToMarkdownOptions
): string;
```

### 2. Yoopta ↔ ブロック変換

#### YooptaToBlocks
```typescript
function yooptaToBlocks(yooptaData: YooptaContentValue): BlockBase[];
```

#### BlocksToYoopta
```typescript
function blocksToYoopta(blocks: BlockBase[]): YooptaContentValue;
```

## バリデーション

### 1. スキーマバリデーション

#### BlockSchema
```typescript
import { z } from 'zod';

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string(),
  attributes: z.record(z.unknown()).optional(),
  children: z.array(z.lazy(() => BlockSchema)).optional(),
  meta: z.object({
    order: z.number(),
    depth: z.number(),
    parent: z.string().optional(),
  }).optional(),
});
```

#### PageSchema
```typescript
const PageSchema = z.object({
  id: z.string(),
  contentId: z.string().optional(),
  slug: z.string(),
  frontmatter: z.record(z.unknown()),
  body: z.string(),
  htmlCache: z.string().optional(),
  path: z.string().optional(),
  lang: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  version: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});
```

### 2. カスタムバリデーション

#### BlockValidator
```typescript
interface BlockValidator {
  validate(block: BlockBase): ValidationResult;
  sanitize(block: BlockBase): BlockBase;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```
