# Content Editor - コンテンツ管理システム

SQLite ベースのコンテンツ管理システム。コンテンツごとに個別のデータベースファイルを作成し、完全なポータビリティを実現します。

## ✨ 主要機能

- 🗄️ **コンテンツごとの個別データベース** - `content-{id}.db` 形式で完全分離
- 🖼️ **画像のバイナリ保存** - データベース内にBLOB形式で保存、外部ファイル不要
- 📝 **Markdown サポート** - フロントマター、全文検索、統計情報
- 🔍 **全文検索（FTS5）** - SQLite の高速全文検索エンジン
- 🌐 **多言語対応** - 言語コードと i18n オブジェクト
- 🎯 **SEO 最適化** - メタタグ、Open Graph、Twitter Card
- 📦 **完全なポータビリティ** - DBファイルをコピーするだけで移行完了
- 🔐 **アクセス制御** - 読み取り・編集権限、オーナー管理

## 🚀 クイックスタート

### インストール

```bash
cd editor-home
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

### 使用可能なページ

- `/` - コンテンツ管理
- `/markdown` - Markdownページ管理
- `/media` - メディア（画像）管理
- `/databases` - データベース管理

## 📚 ドキュメント

包括的なドキュメントは [`docs/`](./docs/) ディレクトリにあります：

### 📖 主要ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [📘 README](./docs/README.md) | ドキュメント概要とクイックスタート |
| [🗃️ DATABASE_SCHEMA](./docs/DATABASE_SCHEMA.md) | データベース構造の完全な仕様 |
| [🔌 API_SPECIFICATION](./docs/API_SPECIFICATION.md) | REST API の完全な仕様 |
| [📝 TYPE_DEFINITIONS](./docs/TYPE_DEFINITIONS.md) | TypeScript 型定義の詳細 |
| [⚙️ SETUP_GUIDE](./docs/SETUP_GUIDE.md) | セットアップと移行の手順書 |

### 📋 参考資料

- [editor-home-design.md](./docs/editor-home-design.md) - 初期設計ドキュメント
- [reference/](./docs/reference/) - 元の型定義参照

## 🏗️ プロジェクト構造

```
content-editor/
├── editor-home/              # メインアプリケーション
│   ├── app/
│   │   ├── api/             # REST API エンドポイント
│   │   │   ├── contents/    # コンテンツ API
│   │   │   ├── markdown/    # Markdown API
│   │   │   ├── media/       # メディア API
│   │   │   └── databases/   # データベース管理 API
│   │   ├── lib/             # コアライブラリ
│   │   │   ├── db.ts                    # データベース接続
│   │   │   ├── content-db-manager.ts    # コンテンツDB管理
│   │   │   ├── content-mapper.ts        # データマッパー
│   │   │   ├── media-manager.ts         # メディア管理
│   │   │   └── markdown-mapper.ts       # Markdownマッパー
│   │   ├── page.tsx         # コンテンツ管理UI
│   │   ├── markdown/        # Markdown管理UI
│   │   ├── media/           # メディア管理UI
│   │   └── databases/       # データベース管理UI
│   ├── types/               # TypeScript 型定義
│   │   ├── common.ts        # 共通型
│   │   ├── content.ts       # コンテンツ型
│   │   ├── markdown.ts      # Markdown型
│   │   ├── media.ts         # メディア型
│   │   ├── seo.ts           # SEO型
│   │   └── database.ts      # データベース型
│   └── data/                # データベースファイル
│       ├── contents/        # コンテンツDB（個別ファイル）
│       │   ├── content-apple01.db
│       │   ├── content-banana02.db
│       │   └── ...
│       └── index.db         # インデックスDB
├── md-editor/               # Markdown エディタ（独立プロジェクト）
└── docs/                    # ドキュメント
```

## 💡 使用例

### コンテンツ作成

```typescript
// API経由
const response = await fetch('/api/contents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'apple01',
    title: 'リンゴのコンテンツ',
    summary: '美味しいリンゴについて',
    tags: ['fruit', 'apple'],
    lang: 'ja',
    status: 'draft'
  })
});
```

### 画像アップロード

```typescript
// ファイル選択後
const file = document.querySelector('input[type="file"]').files[0];
const reader = new FileReader();
reader.onload = async (e) => {
  const base64 = (e.target.result as string).split(',')[1];
  
  await fetch('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId: 'apple01',
      filename: file.name,
      mimeType: file.type,
      base64Data: base64
    })
  });
};
reader.readAsDataURL(file);
```

### Markdownページ作成

```typescript
await fetch('/api/markdown', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentId: 'apple01',
    slug: 'apple-intro',
    frontmatter: {
      title: 'リンゴの紹介',
      author: 'Admin'
    },
    body: '# リンゴの紹介\n\nリンゴは栄養豊富な果物です。',
    lang: 'ja'
  })
});
```

## 🔧 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **データベース**: SQLite3 (better-sqlite3)
- **リンター**: Biome
- **パッケージマネージャー**: pnpm

## 📊 データ構造

### コンテンツデータベース (content-{id}.db)

各コンテンツは独立したデータベースファイルを持ち、以下のテーブルを含みます：

- `contents` - メインコンテンツ
- `content_tags` - タグ
- `content_relations` - コンテンツ間の関係
- `content_assets` - アセット参照
- `content_links` - 外部リンク
- `markdown_pages` - Markdownページ
- `media` - 画像バイナリ（BLOB）
- `contents_fts` - 全文検索インデックス
- `markdown_pages_fts` - Markdown全文検索

詳細は [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) を参照してください。

## 🌟 特徴的な機能

### 1. コンテンツごとの個別データベース

従来の単一データベースではなく、コンテンツごとに独立したデータベースファイルを作成：

```
data/contents/
├── content-apple01.db      # apple01 のすべてのデータ
├── content-banana02.db     # banana02 のすべてのデータ
└── content-orange03.db     # orange03 のすべてのデータ
```

**メリット**:
- コンテンツ単位でバックアップ・移動が簡単
- データベースファイルの肥大化を防止
- 完全な独立性とポータビリティ

### 2. 画像のバイナリ保存

画像ファイルをデータベース内のBLOB型として保存：

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data BLOB NOT NULL,  -- 画像バイナリ
  ...
);
```

**メリット**:
- データベースファイルをコピーするだけで画像も一緒に移行
- 外部ファイルシステムへの依存なし
- バックアップが簡単

### 3. 全文検索 (FTS5)

SQLite の FTS5 を使用した高速全文検索：

```sql
-- コンテンツ検索
SELECT * FROM contents_fts WHERE contents_fts MATCH 'リンゴ';

-- Markdown検索
SELECT * FROM markdown_pages_fts WHERE markdown_pages_fts MATCH 'introduction';
```

## 🔄 移行とバックアップ

### データベースのエクスポート

```bash
# 特定のコンテンツをエクスポート
cp data/contents/content-apple01.db /backup/

# すべてのデータをエクスポート
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

### データベースのインポート

```bash
# 特定のコンテンツをインポート
cp /backup/content-apple01.db data/contents/

# すべてのデータをインポート
tar -xzf backup-20251024.tar.gz
```

詳細は [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) を参照してください。

## 🐛 トラブルシューティング

よくある問題と解決策は [SETUP_GUIDE.md - トラブルシューティング](./docs/SETUP_GUIDE.md#トラブルシューティング) を参照してください。

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

貢献を歓迎します！Issue や Pull Request をお気軽にどうぞ。

---

**開発**: 2025年10月  
**バージョン**: 1.0.0  
**ドキュメント最終更新**: 2025年10月24日
