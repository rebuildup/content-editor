# md-editorとeditor-homeの統合ガイド

## 概要

md-editorは、editor-homeのデータ構造に完全対応したマークダウンエディタです。Yoopta Editorを使用したリッチテキスト編集機能を提供し、記事とメディアをeditor-homeのSQLiteデータベースに保存します。

## 実装された機能

### 1. コンテンツ管理統合

- editor-homeで作成したコンテンツに記事を紐付け
- コンテンツIDベースでの記事管理
- コンテンツ一覧からの選択UI

### 2. マークダウンページ管理

記事データは`markdown_pages`テーブルに保存されます：

```sql
CREATE TABLE markdown_pages (
  id TEXT PRIMARY KEY,
  content_id TEXT,                    -- 紐付けられたコンテンツID
  slug TEXT NOT NULL UNIQUE,          -- URLスラッグ
  frontmatter TEXT NOT NULL,          -- メタデータ（JSON）
  body TEXT NOT NULL,                 -- マークダウン本文
  html_cache TEXT,                    -- HTMLキャッシュ
  path TEXT,
  lang TEXT DEFAULT 'ja',
  status TEXT DEFAULT 'draft',        -- draft/published/archived
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
);
```

### 3. メディア管理（バイナリ保存）

画像や動画は`media`テーブルにバイナリで保存されます：

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  content_id TEXT,                    -- 紐付けられたコンテンツID
  filename TEXT NOT NULL,             -- ファイル名
  mime_type TEXT NOT NULL,            -- MIMEタイプ
  size INTEGER NOT NULL,              -- ファイルサイズ
  width INTEGER,                      -- 幅（ピクセル）
  height INTEGER,                     -- 高さ（ピクセル）
  alt TEXT,                           -- 代替テキスト
  description TEXT,                   -- 説明
  tags TEXT,                          -- タグ（JSON）
  data BLOB NOT NULL,                 -- バイナリデータ
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
);
```

### 4. Yoopta EditorとMarkdownの相互変換

#### サポートされているブロック要素

- 見出し（H1、H2、H3）
- 段落
- 箇条書き（順序なし・順序付き・チェックリスト）
- 引用
- コードブロック
- リンク
- 画像
- 動画
- 水平線
- コールアウト
- テーブル
- アコーディオン
- 埋め込み

#### テキストスタイル

- 太字 (`**text**`)
- 斜体 (`*text*`)
- 下線 (`<u>text</u>`)
- 取り消し線 (`~~text~~`)
- インラインコード (`` `code` ``)
- ハイライト (`==text==`)

## アーキテクチャ

### データフロー

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  md-editor  │  HTTP   │ editor-home  │  SQL    │   SQLite    │
│   (3001)    │ ──────> │    (3000)    │ ──────> │  Database   │
│             │  API    │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

### コンポーネント構成

```
md-editor/
├── app/
│   └── page.tsx                 # メインエディタページ
├── components/
│   ├── content-selector.tsx     # コンテンツ選択UI
│   └── media-uploader.tsx       # メディアアップロードUI
├── lib/
│   ├── api-client.ts            # editor-home APIクライアント
│   └── yoopta-to-markdown.ts    # Yoopta↔Markdown変換
└── types/
    ├── content.ts               # コンテンツ型定義
    ├── markdown.ts              # マークダウン型定義
    └── media.ts                 # メディア型定義
```

## API連携

### 使用するeditor-home API

#### 1. コンテンツAPI

```typescript
GET /api/contents
// コンテンツ一覧を取得

GET /api/contents?id={contentId}
// 特定のコンテンツを取得
```

#### 2. マークダウンAPI

```typescript
GET /api/markdown
// マークダウンページ一覧を取得

GET /api/markdown?id={idOrSlug}
// 特定のページを取得

POST /api/markdown
// 新規ページを作成
Body: {
  contentId: string,
  slug: string,
  frontmatter: object,
  body: string,
  status?: "draft" | "published" | "archived"
}

PUT /api/markdown
// ページを更新
Body: {
  id: string,
  ...更新フィールド
}

DELETE /api/markdown?id={idOrSlug}
// ページを削除
```

#### 3. メディアAPI

```typescript
GET /api/media?contentId={contentId}
// メディア一覧を取得（メタデータのみ）

GET /api/media?contentId={contentId}&id={mediaId}
// 特定のメディアを取得（Base64エンコード）

POST /api/media
// メディアをアップロード
Body: {
  contentId: string,
  filename: string,
  mimeType: string,
  base64Data: string,  // Base64エンコードされたバイナリ
  alt?: string,
  description?: string,
  tags?: string[]
}

DELETE /api/media?contentId={contentId}&id={mediaId}
// メディアを削除
```

## 使用例

### 1. 新規記事の作成

```typescript
// 1. コンテンツを選択
const contentId = "apple01";

// 2. 記事を執筆（Yooptaエディタで）
const yooptaContent = { ... };

// 3. Markdownに変換
const markdown = convertYooptaToMarkdown(yooptaContent);

// 4. 保存
await createMarkdownPage({
  contentId,
  slug: "my-first-article",
  frontmatter: {
    title: "初めての記事",
    date: new Date().toISOString()
  },
  body: markdown,
  status: "draft"
});
```

### 2. メディアのアップロード

```typescript
// 1. ファイルをBase64に変換
const file = event.target.files[0];
const base64Data = await fileToBase64(file);

// 2. アップロード
const result = await uploadMedia({
  contentId: "apple01",
  filename: file.name,
  mimeType: file.type,
  base64Data,
  alt: "サンプル画像"
});

// 3. メディアURL
const mediaUrl = `http://localhost:3000/api/media?contentId=apple01&id=${result.id}`;

// 4. マークダウンに挿入
const markdown = `![サンプル画像](${mediaUrl})`;
```

### 3. 記事の読み込み

```typescript
// スラッグで検索
const pages = await fetchMarkdownPages();
const page = pages.find(p => p.slug === "my-first-article");

if (page) {
  // Yooptaエディタに変換
  const yooptaContent = convertMarkdownToYoopta(page.body);
  setValue(yooptaContent);
}
```

## 開発ガイド

### セットアップ手順

1. **editor-homeを起動**

```bash
cd editor-home
pnpm install
pnpm dev  # http://localhost:3000
```

2. **md-editorを起動**

```bash
cd md-editor
pnpm install
pnpm dev  # http://localhost:3001
```

3. **環境変数を設定**

`md-editor/.env.local`:
```
NEXT_PUBLIC_EDITOR_HOME_URL=http://localhost:3000
```

### テストフロー

1. editor-homeでコンテンツを作成
2. md-editorでそのコンテンツに記事を紐付け
3. 記事を執筆
4. メディアをアップロード
5. 記事を保存
6. editor-homeのデータベースで確認

```bash
# データベースを確認
cd editor-home/data/contents
sqlite3 content-{contentId}.db

# マークダウンページを確認
SELECT * FROM markdown_pages;

# メディアを確認
SELECT id, filename, mime_type, size FROM media;
```

## トラブルシューティング

### 問題: CORSエラーが発生する

**原因**: editor-homeがCORS設定をしていない

**解決策**: editor-homeの`next.config.ts`にCORS設定を追加

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

### 問題: メディアが表示されない

**原因**: メディアURLが正しくない

**解決策**: 
- メディアURLは`http://localhost:3000/api/media?contentId={id}&id={mediaId}`形式
- Base64データとして取得される

### 問題: 保存できない

**チェックリスト**:
1. editor-homeが起動しているか
2. コンテンツが選択されているか
3. スラッグが入力されているか
4. スラッグが重複していないか
5. ネットワークエラーがないか（ブラウザのコンソールを確認）

## 今後の拡張案

### 機能拡張

- [ ] 画像の自動リサイズ機能
- [ ] 動画のサムネイル生成
- [ ] マークダウンプレビュー機能
- [ ] 記事の全文検索
- [ ] バージョン履歴管理
- [ ] 共同編集機能
- [ ] リアルタイム保存（オートセーブ）

### パフォーマンス改善

- [ ] メディアの遅延読み込み
- [ ] 大きな画像の自動圧縮
- [ ] インクリメンタルな保存
- [ ] オフライン対応

## まとめ

md-editorとeditor-homeの統合により、以下が実現されました：

✅ コンテンツベースの記事管理  
✅ メディアのバイナリ保存  
✅ マークダウンとリッチテキストの相互変換  
✅ 完全なデータ永続化  
✅ 統一されたデータベース構造  

この統合により、記事作成からメディア管理まで、一貫したワークフローで効率的にコンテンツを管理できます。

