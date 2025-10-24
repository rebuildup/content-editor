# 型定義仕様

このドキュメントは、コンテンツ管理システムで使用される TypeScript 型定義を説明します。

## 1. 共通型 (types/common.ts)

### ISODate

ISO 8601形式の日付文字列。

```typescript
type ISODate = string;
// 例: "2025-10-24T22:09:00.000Z"
```

### AssetRef

アセット（画像・動画など）の参照情報。

```typescript
interface AssetRef {
  src: string;           // アセットのURL
  type?: string;         // MIMEタイプ (例: "image/jpeg")
  width?: number;        // 幅（ピクセル）
  height?: number;       // 高さ（ピクセル）
  alt?: string;          // 代替テキスト
  meta?: Record<string, any>; // 追加メタデータ
}
```

### ThumbnailVariants

サムネイル画像のバリエーション。

```typescript
interface ThumbnailVariants {
  small?: AssetRef;   // 小サイズ (例: 100x100)
  medium?: AssetRef;  // 中サイズ (例: 300x300)
  large?: AssetRef;   // 大サイズ (例: 800x800)
  [key: string]: AssetRef | undefined; // カスタムサイズ
}
```

### ContentLink

外部リンク情報。

```typescript
interface ContentLink {
  href: string;          // リンクURL
  label?: string;        // 表示ラベル
  rel?: string;          // リレーション (例: "external", "nofollow")
  isPrimary?: boolean;   // プライマリリンクか
  description?: string;  // 説明文
}
```

### ContentRelation

コンテンツ間の関係性。

```typescript
interface ContentRelation {
  targetId: string;                // 関連先コンテンツID
  type: string;                    // 関係タイプ (例: "related", "parent", "child")
  bidirectional?: boolean;         // 双方向関係か
  weight?: number;                 // 重み（0.0〜1.0）
  meta?: Record<string, any>;      // 追加メタデータ
}
```

### SearchOptions

検索オプション。

```typescript
interface SearchOptions {
  fullText?: string;               // 全文検索文字列
  tokens?: string[];               // 検索トークン
  boost?: Record<string, number>;  // フィールドブースト値
}
```

### SearchResult

検索結果。

```typescript
interface SearchResult<T> {
  items: T[];           // 検索結果アイテム
  total: number;        // 総件数
  page?: number;        // 現在のページ
  pageSize?: number;    // ページサイズ
  hasMore?: boolean;    // 次ページがあるか
}
```

---

## 2. SEO型 (types/seo.ts)

### SEO

SEO関連のメタデータ。

```typescript
interface SEO {
  // 基本メタ
  metaTitle?: string;           // <title>タグ
  metaDescription?: string;     // <meta name="description">
  metaKeywords?: string[];      // キーワード（非推奨だが互換性のため）
  
  // Open Graph
  ogTitle?: string;             // og:title
  ogDescription?: string;       // og:description
  ogImage?: string;             // og:image URL
  ogType?: string;              // og:type (例: "article", "website")
  ogUrl?: string;               // og:url
  ogSiteName?: string;          // og:site_name
  ogLocale?: string;            // og:locale (例: "ja_JP")
  
  // Twitter Card
  twitterCard?: string;         // twitter:card (例: "summary", "summary_large_image")
  twitterSite?: string;         // twitter:site (@username)
  twitterCreator?: string;      // twitter:creator (@username)
  twitterTitle?: string;        // twitter:title
  twitterDescription?: string;  // twitter:description
  twitterImage?: string;        // twitter:image URL
  
  // 構造化データ
  structuredData?: Record<string, any>; // JSON-LD形式
  
  // カノニカル
  canonical?: string;           // カノニカルURL
  
  // Robots
  robots?: string;              // robots メタタグ (例: "noindex,nofollow")
  
  // その他
  author?: string;              // 著者名
  publishedTime?: string;       // 公開日時 (ISO 8601)
  modifiedTime?: string;        // 更新日時 (ISO 8601)
}
```

---

## 3. コンテンツ型 (types/content.ts)

### Content

メインのコンテンツデータ構造。

```typescript
interface Content {
  // ========== コア（必須） ==========
  id: string;                   // コンテンツID (例: "apple01")
  title: string;                // タイトル
  publicUrl?: string;           // 公開URL
  
  // ========== 基本情報 ==========
  summary?: string;             // 要約
  tags?: string[];              // タグ配列
  lang?: string;                // 言語コード (例: "ja", "en")
  
  // ========== ツリー構造 ==========
  parentId?: string;            // 親コンテンツID
  ancestorIds?: string[];       // 祖先コンテンツID配列
  path?: string;                // パス (例: "/docs/intro")
  depth?: number;               // 階層の深さ
  order?: number;               // 並び順
  childCount?: number;          // 子要素数
  
  // ========== 状態と公開 ==========
  visibility?: 'public' | 'unlisted' | 'private' | 'draft'; // 可視性
  status?: 'draft' | 'published' | 'archived';              // ステータス
  publishedAt?: ISODate;        // 公開日時
  unpublishedAt?: ISODate;      // 非公開日時
  
  // ========== アセット ==========
  assets?: AssetRef[];          // 関連アセット
  thumbnails?: ThumbnailVariants; // サムネイル
  
  // ========== リンク ==========
  links?: ContentLink[];        // 外部リンク
  
  // ========== 関係性 ==========
  relations?: ContentRelation[]; // 関連コンテンツ
  
  // ========== 検索 ==========
  searchable?: SearchOptions;   // 検索オプション
  
  // ========== SEO ==========
  seo?: SEO;                    // SEOメタデータ
  
  // ========== 多言語化 ==========
  i18n?: Record<string, {       // 言語ごとのバリエーション
    title?: string;
    summary?: string;
    url?: string;
  }>;
  
  // ========== バージョニング ==========
  version?: number;             // バージョン番号
  versionLatestId?: string;     // 最新バージョンID
  versionPreviousId?: string;   // 前バージョンID
  versionHistoryRef?: string;   // バージョン履歴参照
  editHistory?: EditHistoryEntry[]; // 編集履歴
  
  // ========== アクセス制御 ==========
  permissions?: {
    readers?: string[];         // 読み取り権限ユーザーID
    editors?: string[];         // 編集権限ユーザーID
    owner?: string;             // オーナーユーザーID
  };
  
  // ========== キャッシュ ==========
  cache?: {
    html?: string;              // HTML キャッシュ
    expiresAt?: ISODate;        // キャッシュ有効期限
  };
  
  // ========== プライベートデータ ==========
  privateData?: Record<string, any>; // 非公開データ
  
  // ========== 拡張 ==========
  ext?: Record<string, any>;    // 拡張フィールド
  
  // ========== タイムスタンプ ==========
  createdAt: ISODate;           // 作成日時
  updatedAt: ISODate;           // 更新日時
  lastAccessedAt?: ISODate;     // 最終アクセス日時
}
```

### EditHistoryEntry

編集履歴のエントリ。

```typescript
interface EditHistoryEntry {
  timestamp: ISODate;           // 編集日時
  userId?: string;              // 編集者ID
  action: string;               // アクション (例: "create", "update", "delete")
  fields?: string[];            // 変更されたフィールド
  comment?: string;             // コメント
}
```

---

## 4. Markdown型 (types/markdown.ts)

### MarkdownPage

Markdownページデータ。

```typescript
interface MarkdownPage {
  id: string;                   // ページID
  contentId?: string;           // 紐付けコンテンツID
  slug: string;                 // スラッグ (URL識別子)
  frontmatter: MarkdownFrontmatter; // フロントマター
  body: string;                 // Markdown本文
  htmlCache?: string;           // HTML変換キャッシュ
  path?: string;                // パス
  lang?: string;                // 言語コード
  status?: 'draft' | 'published' | 'archived'; // ステータス
  version?: number;             // バージョン番号
  createdAt: ISODate;           // 作成日時
  updatedAt: ISODate;           // 更新日時
  publishedAt?: ISODate;        // 公開日時
}
```

### MarkdownFrontmatter

Markdownフロントマター。

```typescript
interface MarkdownFrontmatter {
  title?: string;               // タイトル
  description?: string;         // 説明
  author?: string;              // 著者
  date?: string;                // 日付
  tags?: string[];              // タグ
  category?: string;            // カテゴリ
  [key: string]: any;           // カスタムフィールド
}
```

### MarkdownStats

Markdownページの統計情報。

```typescript
interface MarkdownStats {
  characterCount: number;               // 文字数（総数）
  characterCountWithoutSpaces: number;  // 文字数（空白除く）
  wordCount: number;                    // 単語数
  lineCount: number;                    // 行数
  paragraphCount: number;               // 段落数
  headingCount: number;                 // 見出し数
  codeBlockCount: number;               // コードブロック数
  listCount: number;                    // リスト数
  linkCount: number;                    // リンク数
  imageCount: number;                   // 画像数
}
```

---

## 5. メディア型 (types/media.ts)

### MediaItem

メディア（画像）アイテム。

```typescript
interface MediaItem {
  id: string;                   // メディアID
  contentId?: string;           // 紐付けコンテンツID
  filename: string;             // ファイル名
  mimeType: string;             // MIMEタイプ (例: "image/jpeg")
  size: number;                 // ファイルサイズ（バイト）
  width?: number;               // 幅（ピクセル）
  height?: number;              // 高さ（ピクセル）
  alt?: string;                 // 代替テキスト
  description?: string;         // 説明
  tags?: string[];              // タグ
  createdAt: ISODate;           // 作成日時
  updatedAt: ISODate;           // 更新日時
  data?: Buffer;                // バイナリデータ（取得時）
  base64?: string;              // Base64エンコード文字列（フロントエンド用）
}
```

### MediaUploadRequest

メディアアップロードリクエスト。

```typescript
interface MediaUploadRequest {
  contentId?: string;           // 紐付けコンテンツID
  filename: string;             // ファイル名
  mimeType: string;             // MIMEタイプ
  base64Data: string;           // Base64エンコードされた画像データ
  alt?: string;                 // 代替テキスト
  description?: string;         // 説明
  tags?: string[];              // タグ
}
```

---

## 6. データベース型 (types/database.ts)

### DatabaseInfo

データベース情報。

```typescript
interface DatabaseInfo {
  id: string;                   // データベースID（ファイル名）
  name: string;                 // 表示名
  description?: string;         // 説明
  createdAt: ISODate;           // 作成日時
  updatedAt: ISODate;           // 更新日時
  size: number;                 // ファイルサイズ（バイト）
  isActive: boolean;            // アクティブかどうか
}
```

### DatabaseStats

データベース統計情報。

```typescript
interface DatabaseStats {
  id: string;                   // データベースID
  contentsCount: number;        // コンテンツ数
  markdownPagesCount: number;   // Markdownページ数
  tagsCount: number;            // タグ数
  fileSize: number;             // ファイルサイズ
}
```

---

## 使用例

### コンテンツ作成

```typescript
const newContent: Partial<Content> = {
  id: 'apple01',
  title: 'リンゴのコンテンツ',
  summary: '美味しいリンゴについて',
  tags: ['fruit', 'apple'],
  lang: 'ja',
  status: 'draft',
  visibility: 'draft',
  seo: {
    metaTitle: 'リンゴのコンテンツ',
    metaDescription: '美味しいリンゴについての詳細情報',
    ogImage: '/images/apple-og.jpg'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### Markdownページ作成

```typescript
const newPage: Partial<MarkdownPage> = {
  contentId: 'apple01',
  slug: 'apple-intro',
  frontmatter: {
    title: 'リンゴの紹介',
    author: 'Admin',
    date: '2025-10-24',
    tags: ['fruit', 'introduction']
  },
  body: '# リンゴの紹介\n\nリンゴは栄養豊富な果物です。',
  lang: 'ja',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### メディアアップロード

```typescript
const uploadRequest: MediaUploadRequest = {
  contentId: 'apple01',
  filename: 'apple.jpg',
  mimeType: 'image/jpeg',
  base64Data: 'iVBORw0KGgoAAAANSUhEUgAA...',
  alt: '赤いリンゴ',
  description: 'フレッシュな赤いリンゴの写真',
  tags: ['apple', 'red', 'fruit']
};
```

---

## 型の継承と拡張

### カスタム型の追加

```typescript
// 拡張例: ブログ専用のコンテンツ型
interface BlogContent extends Content {
  excerpt?: string;
  readingTime?: number;
  featuredImage?: AssetRef;
  categories?: string[];
}
```

### 部分型の使用

```typescript
// 作成時は一部のフィールドのみ必須
type CreateContentRequest = Pick<Content, 'id' | 'title'> & Partial<Content>;

// 更新時はidが必須で他はオプション
type UpdateContentRequest = Pick<Content, 'id'> & Partial<Content>;
```

---

## 注意事項

1. **JSON シリアライゼーション**: データベースに保存する際、オブジェクト型は`JSON.stringify()`でシリアライズ
2. **日付形式**: すべての日付は ISO 8601 形式の文字列として扱う
3. **バイナリデータ**: メディアのバイナリデータは Buffer 型（Node.js）または Base64 文字列（フロントエンド）
4. **オプショナル**: `?` 付きフィールドはオプショナル（undefined 許可）

