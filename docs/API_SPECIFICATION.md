# API仕様書

このドキュメントは、コンテンツ管理システムのREST APIを定義します。

## ベースURL

開発環境: `http://localhost:3000/api`

## 共通仕様

### レスポンス形式

すべてのAPIレスポンスはJSON形式です。

**成功レスポンス**:
```json
{
  "ok": true,
  "data": { ... }
}
```

**エラーレスポンス**:
```json
{
  "error": "エラーメッセージ"
}
```

### HTTPステータスコード

- `200 OK`: 成功
- `400 Bad Request`: リクエストが不正
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

---

## 1. コンテンツ API

### GET /api/contents

コンテンツ一覧を取得（インデックスから）。

**パラメータ**:
- `id` (optional): 特定のコンテンツIDを指定すると詳細を取得

**レスポンス（一覧）**:
```json
[
  {
    "id": "apple01",
    "dbFile": "content-apple01.db",
    "title": "リンゴのコンテンツ",
    "summary": "美味しいリンゴについて",
    "lang": "ja",
    "status": "draft",
    "visibility": "draft",
    "createdAt": "2025-10-24T22:09:00.000Z",
    "updatedAt": "2025-10-24T22:09:00.000Z",
    "publishedAt": null,
    "tags": ["fruit", "apple"],
    "thumbnails": { ... },
    "seo": { ... }
  }
]
```

**レスポンス（詳細）**:
```json
{
  "id": "apple01",
  "title": "リンゴのコンテンツ",
  "summary": "美味しいリンゴについて",
  "tags": ["fruit", "apple"],
  "assets": [
    {
      "src": "/images/apple.jpg",
      "type": "image/jpeg",
      "width": 800,
      "height": 600,
      "alt": "赤いリンゴ"
    }
  ],
  "links": [
    {
      "href": "https://example.com",
      "label": "公式サイト",
      "rel": "external"
    }
  ],
  "relations": [
    {
      "targetId": "banana02",
      "type": "related",
      "weight": 1.0
    }
  ],
  "seo": {
    "metaTitle": "リンゴのコンテンツ",
    "metaDescription": "美味しいリンゴについて"
  },
  "createdAt": "2025-10-24T22:09:00.000Z",
  "updatedAt": "2025-10-24T22:09:00.000Z"
}
```

### POST /api/contents

新しいコンテンツを作成。

**リクエストボディ**:
```json
{
  "id": "apple01",
  "title": "リンゴのコンテンツ",
  "summary": "美味しいリンゴについて",
  "tags": ["fruit", "apple"],
  "lang": "ja",
  "status": "draft",
  "visibility": "draft",
  "assets": [...],
  "links": [...],
  "seo": {...}
}
```

**レスポンス**:
```json
{
  "ok": true,
  "id": "apple01"
}
```

### PUT /api/contents

既存のコンテンツを更新。

**リクエストボディ**:
```json
{
  "id": "apple01",
  "title": "更新されたタイトル",
  "summary": "更新された要約"
}
```

**レスポンス**:
```json
{
  "ok": true
}
```

### DELETE /api/contents?id={id}

コンテンツを削除（データベースファイルごと削除）。

**レスポンス**:
```json
{
  "ok": true
}
```

### GET /api/contents/stats

コンテンツ統計を取得。

**レスポンス**:
```json
{
  "totalContents": 3,
  "totalDbFiles": 3,
  "totalSize": 372000,
  "contentsList": [
    {
      "id": "apple01",
      "title": "リンゴのコンテンツ",
      "dbFile": "content-apple01.db",
      "size": 118784
    }
  ]
}
```

---

## 2. Markdown API

### GET /api/markdown?contentId={contentId}

指定コンテンツのMarkdownページ一覧を取得。

**パラメータ**:
- `contentId` (required): コンテンツID
- `id` (optional): 特定のMarkdownページIDを指定すると詳細を取得

**レスポンス（一覧）**:
```json
[
  {
    "id": "md_1761310633792",
    "contentId": "apple01",
    "slug": "apple-intro",
    "frontmatter": {
      "title": "リンゴの紹介",
      "author": "Admin",
      "date": "2025-10-24"
    },
    "lang": "ja",
    "status": "draft",
    "version": 1,
    "createdAt": "2025-10-24T22:09:00.000Z",
    "updatedAt": "2025-10-24T22:09:00.000Z"
  }
]
```

**レスポンス（詳細）**:
```json
{
  "id": "md_1761310633792",
  "contentId": "apple01",
  "slug": "apple-intro",
  "frontmatter": { ... },
  "body": "# リンゴの紹介\n\nリンゴは...",
  "htmlCache": "<h1>リンゴの紹介</h1><p>リンゴは...</p>",
  "path": "/docs/apple-intro",
  "lang": "ja",
  "status": "draft",
  "version": 1,
  "createdAt": "2025-10-24T22:09:00.000Z",
  "updatedAt": "2025-10-24T22:09:00.000Z",
  "publishedAt": null
}
```

### POST /api/markdown

新しいMarkdownページを作成。

**リクエストボディ**:
```json
{
  "contentId": "apple01",
  "slug": "apple-intro",
  "frontmatter": {
    "title": "リンゴの紹介",
    "author": "Admin"
  },
  "body": "# リンゴの紹介\n\nリンゴは...",
  "lang": "ja",
  "status": "draft"
}
```

**レスポンス**:
```json
{
  "ok": true,
  "id": "md_1761310633792"
}
```

### PUT /api/markdown

既存のMarkdownページを更新。

**リクエストボディ**:
```json
{
  "id": "md_1761310633792",
  "contentId": "apple01",
  "slug": "apple-intro",
  "body": "# 更新されたリンゴの紹介\n\n..."
}
```

**レスポンス**:
```json
{
  "ok": true
}
```

### DELETE /api/markdown?contentId={contentId}&id={id}

Markdownページを削除。

**レスポンス**:
```json
{
  "ok": true
}
```

### POST /api/markdown/stats

Markdownページの統計を取得。

**リクエストボディ**:
```json
{
  "contentId": "apple01",
  "markdownId": "md_1761310633792"
}
```

**レスポンス**:
```json
{
  "characterCount": 1234,
  "characterCountWithoutSpaces": 1000,
  "wordCount": 250,
  "lineCount": 45,
  "paragraphCount": 12,
  "headingCount": 5,
  "codeBlockCount": 2,
  "listCount": 3,
  "linkCount": 8,
  "imageCount": 3
}
```

---

## 3. メディア API

### GET /api/media?contentId={contentId}

指定コンテンツのメディア（画像）一覧を取得。

**パラメータ**:
- `contentId` (required): コンテンツID
- `id` (optional): 特定のメディアIDを指定すると詳細（Base64含む）を取得

**レスポンス（一覧）**:
```json
[
  {
    "id": "media_1761311825208_ilaa579jp",
    "contentId": "orange03",
    "filename": "globe.svg",
    "mimeType": "image/svg+xml",
    "size": 1024,
    "width": null,
    "height": null,
    "alt": "globe.svg",
    "description": "Imported from public/globe.svg",
    "tags": null,
    "createdAt": "2025-10-24T22:30:00.000Z",
    "updatedAt": "2025-10-24T22:30:00.000Z"
  }
]
```

**レスポンス（詳細）**:
```json
{
  "id": "media_1761311825208_ilaa579jp",
  "contentId": "orange03",
  "filename": "globe.svg",
  "mimeType": "image/svg+xml",
  "size": 1024,
  "alt": "globe.svg",
  "description": "Imported from public/globe.svg",
  "base64": "PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiI+...",
  "createdAt": "2025-10-24T22:30:00.000Z",
  "updatedAt": "2025-10-24T22:30:00.000Z"
}
```

### POST /api/media

新しいメディア（画像）をアップロード。

**リクエストボディ**:
```json
{
  "contentId": "orange03",
  "filename": "example.jpg",
  "mimeType": "image/jpeg",
  "base64Data": "iVBORw0KGgoAAAANSUhEUgAA...",
  "alt": "サンプル画像",
  "description": "説明文",
  "tags": ["tag1", "tag2"]
}
```

**レスポンス**:
```json
{
  "ok": true,
  "id": "media_1761311825208_ilaa579jp"
}
```

### DELETE /api/media?contentId={contentId}&id={id}

メディア（画像）を削除。

**レスポンス**:
```json
{
  "ok": true
}
```

### GET /api/media/stats?contentId={contentId}

メディア統計を取得。

**レスポンス**:
```json
{
  "totalCount": 2,
  "totalSize": 2400,
  "byMimeType": {
    "image/svg+xml": 2,
    "image/jpeg": 0
  }
}
```

### GET /api/media/import-public

publicフォルダの画像一覧を取得。

**レスポンス**:
```json
[
  {
    "filename": "globe.svg",
    "size": 1024,
    "mimeType": "image/svg+xml"
  }
]
```

### POST /api/media/import-public

publicフォルダから画像をインポート。

**リクエストボディ**:
```json
{
  "contentId": "orange03",
  "filename": "globe.svg",
  "alt": "地球アイコン",
  "description": "グローバルナビゲーション用",
  "tags": ["icon", "navigation"]
}
```

**レスポンス**:
```json
{
  "ok": true,
  "id": "media_1761311825208_ilaa579jp"
}
```

---

## 4. データベース管理 API

### GET /api/databases

データベース一覧を取得。

**レスポンス**:
```json
{
  "databases": [
    {
      "id": "content.db",
      "name": "デフォルトデータベース",
      "description": "メインのコンテンツデータベース",
      "createdAt": "2025-10-24T22:01:35.000Z",
      "updatedAt": "2025-10-24T21:56:18.000Z",
      "size": 4096,
      "isActive": true
    }
  ],
  "activeDatabase": "content.db"
}
```

### POST /api/databases

データベース操作（作成・コピー・切り替え）。

**リクエストボディ（作成）**:
```json
{
  "action": "create",
  "id": "test-database",
  "name": "テストデータベース",
  "description": "テスト用"
}
```

**リクエストボディ（コピー）**:
```json
{
  "action": "copy",
  "sourceId": "content.db",
  "targetId": "content-backup",
  "name": "バックアップ",
  "description": "2025-10-24のバックアップ"
}
```

**リクエストボディ（切り替え）**:
```json
{
  "action": "switch",
  "id": "content-backup.db"
}
```

**レスポンス**:
```json
{
  "ok": true,
  "id": "test-database.db"
}
```

### PUT /api/databases

データベース情報を更新。

**リクエストボディ**:
```json
{
  "id": "content.db",
  "name": "更新された名前",
  "description": "更新された説明"
}
```

**レスポンス**:
```json
{
  "ok": true
}
```

### DELETE /api/databases?id={id}

データベースを削除（アクティブなデータベースは削除不可）。

**レスポンス**:
```json
{
  "ok": true
}
```

### GET /api/databases/stats?id={id}

データベース統計を取得。

**レスポンス**:
```json
{
  "id": "content.db",
  "contentsCount": 10,
  "markdownPagesCount": 5,
  "tagsCount": 20,
  "fileSize": 118784
}
```

---

## エラーハンドリング

### 一般的なエラー

**400 Bad Request**:
```json
{
  "error": "ID and title are required"
}
```

**404 Not Found**:
```json
{
  "error": "Content not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to fetch contents"
}
```

---

## セキュリティ考慮事項

1. **SQL Injection**: プリペアドステートメント使用
2. **ファイル名サニタイズ**: 特殊文字を`_`に置換
3. **BLOB サイズ制限**: 実装推奨（例: 10MB）
4. **認証**: 必要に応じてJWT等を実装

---

## レート制限

現在、レート制限は実装されていません。本番環境では実装を推奨します。

---

## バージョニング

現在のAPIバージョン: v1 (明示的なバージョン指定なし)

将来的なバージョニング例: `/api/v2/contents`

