# API仕様

## 概要

page-editorのAPI仕様は、既存のeditor-homeのAPIを基盤とし、ブロックシステムに対応した拡張を行います。

## ベースURL

```
http://localhost:3020/api
```

## 認証

現在は認証なしでアクセス可能ですが、将来的にはJWTトークンベースの認証を実装予定です。

## 共通レスポンス形式

### 成功レスポンス
```json
{
  "ok": true,
  "data": { ... },
  "message": "操作が完了しました"
}
```

### エラーレスポンス
```json
{
  "ok": false,
  "error": "エラーメッセージ",
  "details": "詳細なエラー情報"
}
```

## コンテンツ管理API

### コンテンツ一覧取得

#### GET /api/contents

コンテンツの一覧を取得します。

**リクエスト**
```http
GET /api/contents
```

**レスポンス**
```json
[
  {
    "id": "content-1",
    "title": "サンプルコンテンツ",
    "summary": "コンテンツの概要",
    "lang": "ja",
    "status": "draft",
    "visibility": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "publishedAt": null,
    "tags": ["tag1", "tag2"]
  }
]
```

### コンテンツ詳細取得

#### GET /api/contents?id={id}

特定のコンテンツの詳細情報を取得します。

**リクエスト**
```http
GET /api/contents?id=content-1
```

**レスポンス**
```json
{
  "id": "content-1",
  "title": "サンプルコンテンツ",
  "summary": "コンテンツの概要",
  "lang": "ja",
  "status": "draft",
  "visibility": "draft",
  "thumbnails": {},
  "assets": {},
  "links": {},
  "seo": {},
  "searchable": {
    "fullText": "サンプルコンテンツ コンテンツの概要 tag1 tag2"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "publishedAt": null,
  "tags": ["tag1", "tag2"]
}
```

### コンテンツ作成

#### POST /api/contents

新しいコンテンツを作成します。

**リクエスト**
```json
{
  "id": "content-2",
  "title": "新しいコンテンツ",
  "summary": "新しいコンテンツの概要",
  "lang": "ja",
  "status": "draft",
  "visibility": "draft",
  "tags": ["tag1", "tag2"]
}
```

**レスポンス**
```json
{
  "ok": true,
  "id": "content-2"
}
```

### コンテンツ更新

#### PUT /api/contents

既存のコンテンツを更新します。

**リクエスト**
```json
{
  "id": "content-1",
  "title": "更新されたコンテンツ",
  "summary": "更新された概要",
  "status": "published"
}
```

**レスポンス**
```json
{
  "ok": true
}
```

### コンテンツ削除

#### DELETE /api/contents?id={id}

コンテンツを削除します。

**リクエスト**
```http
DELETE /api/contents?id=content-1
```

**レスポンス**
```json
{
  "ok": true
}
```

## マークダウンページAPI

### ページ一覧取得

#### GET /api/markdown

マークダウンページの一覧を取得します。

**クエリパラメータ**
- `contentId`: コンテンツID（オプション）

**リクエスト**
```http
GET /api/markdown?contentId=content-1
```

**レスポンス**
```json
[
  {
    "id": "page-1",
    "contentId": "content-1",
    "slug": "sample-page",
    "frontmatter": {
      "title": "サンプルページ",
      "description": "ページの説明",
      "tags": ["tag1", "tag2"],
      "draft": false
    },
    "body": "# サンプルページ\n\nこれはサンプルページです。",
    "lang": "ja",
    "status": "published",
    "version": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "path": "/sample-page",
    "htmlCache": "<h1>サンプルページ</h1><p>これはサンプルページです。</p>"
  }
]
```

### ページ詳細取得

#### GET /api/markdown?id={id}

特定のページの詳細情報を取得します。

**リクエスト**
```http
GET /api/markdown?id=page-1
```

**レスポンス**
```json
{
  "id": "page-1",
  "contentId": "content-1",
  "slug": "sample-page",
  "frontmatter": {
    "title": "サンプルページ",
    "description": "ページの説明",
    "tags": ["tag1", "tag2"],
    "draft": false
  },
  "body": "# サンプルページ\n\nこれはサンプルページです。",
  "lang": "ja",
  "status": "published",
  "version": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "path": "/sample-page",
  "htmlCache": "<h1>サンプルページ</h1><p>これはサンプルページです。</p>"
}
```

### ページ作成

#### POST /api/markdown

新しいマークダウンページを作成します。

**リクエスト**
```json
{
  "contentId": "content-1",
  "slug": "new-page",
  "frontmatter": {
    "title": "新しいページ",
    "description": "新しいページの説明",
    "tags": ["tag1", "tag2"],
    "draft": true
  },
  "body": "# 新しいページ\n\nこれは新しいページです。",
  "lang": "ja",
  "status": "draft"
}
```

**レスポンス**
```json
{
  "ok": true,
  "id": "page-2",
  "slug": "new-page",
  "page": {
    "id": "page-2",
    "contentId": "content-1",
    "slug": "new-page",
    "frontmatter": {
      "title": "新しいページ",
      "description": "新しいページの説明",
      "tags": ["tag1", "tag2"],
      "draft": true
    },
    "body": "# 新しいページ\n\nこれは新しいページです。",
    "lang": "ja",
    "status": "draft",
    "version": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### ページ更新

#### PUT /api/markdown

既存のマークダウンページを更新します。

**リクエスト**
```json
{
  "id": "page-1",
  "slug": "updated-page",
  "frontmatter": {
    "title": "更新されたページ",
    "description": "更新された説明",
    "tags": ["tag1", "tag2", "tag3"],
    "draft": false
  },
  "body": "# 更新されたページ\n\nこれは更新されたページです。",
  "status": "published"
}
```

**レスポンス**
```json
{
  "ok": true,
  "id": "page-1",
  "slug": "updated-page",
  "page": {
    "id": "page-1",
    "contentId": "content-1",
    "slug": "updated-page",
    "frontmatter": {
      "title": "更新されたページ",
      "description": "更新された説明",
      "tags": ["tag1", "tag2", "tag3"],
      "draft": false
    },
    "body": "# 更新されたページ\n\nこれは更新されたページです。",
    "lang": "ja",
    "status": "published",
    "version": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "publishedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### ページ削除

#### DELETE /api/markdown?id={id}

マークダウンページを削除します。

**リクエスト**
```http
DELETE /api/markdown?id=page-1
```

**レスポンス**
```json
{
  "ok": true,
  "id": "page-1"
}
```

## メディア管理API

### メディア一覧取得

#### GET /api/media

メディアファイルの一覧を取得します。

**クエリパラメータ**
- `contentId`: コンテンツID（必須）

**リクエスト**
```http
GET /api/media?contentId=content-1
```

**レスポンス**
```json
[
  {
    "id": "media-1",
    "contentId": "content-1",
    "filename": "sample.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "width": 1920,
    "height": 1080,
    "alt": "サンプル画像",
    "description": "サンプル画像の説明",
    "tags": ["image", "sample"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### メディア詳細取得

#### GET /api/media?contentId={contentId}&id={id}

特定のメディアファイルの詳細情報を取得します。

**リクエスト**
```http
GET /api/media?contentId=content-1&id=media-1
```

**レスポンス**
```json
{
  "id": "media-1",
  "contentId": "content-1",
  "filename": "sample.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "width": 1920,
  "height": 1080,
  "alt": "サンプル画像",
  "description": "サンプル画像の説明",
  "tags": ["image", "sample"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### メディアアップロード

#### POST /api/media

メディアファイルをアップロードします。

**リクエスト**
```json
{
  "contentId": "content-1",
  "filename": "new-image.jpg",
  "mimeType": "image/jpeg",
  "base64Data": "/9j/4AAQSkZJRgABAQAAAQ...",
  "alt": "新しい画像",
  "description": "新しい画像の説明",
  "tags": ["image", "new"]
}
```

**レスポンス**
```json
{
  "ok": true,
  "id": "media-2"
}
```

### メディア削除

#### DELETE /api/media?contentId={contentId}&id={id}

メディアファイルを削除します。

**リクエスト**
```http
DELETE /api/media?contentId=content-1&id=media-1
```

**レスポンス**
```json
{
  "ok": true
}
```

## ブロックシステムAPI（拡張予定）

### ブロック解析

#### POST /api/blocks/parse

Markdownテキストをブロックに解析します。

**リクエスト**
```json
{
  "markdown": "# タイトル\n\n<Image src=\"image.jpg\" alt=\"画像\" />\n\nテキスト"
}
```

**レスポンス**
```json
{
  "ok": true,
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "content": "タイトル"
    },
    {
      "type": "image",
      "src": "image.jpg",
      "alt": "画像"
    },
    {
      "type": "text",
      "content": "テキスト"
    }
  ]
}
```

### ブロックレンダリング

#### POST /api/blocks/render

ブロックをHTMLにレンダリングします。

**リクエスト**
```json
{
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "content": "タイトル"
    },
    {
      "type": "image",
      "src": "image.jpg",
      "alt": "画像"
    }
  ]
}
```

**レスポンス**
```json
{
  "ok": true,
  "html": "<h1>タイトル</h1><img src=\"image.jpg\" alt=\"画像\" />"
}
```

## エラーハンドリング

### HTTPステータスコード

- `200 OK`: 成功
- `201 Created`: 作成成功
- `400 Bad Request`: リクエストエラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

### エラー例

#### 400 Bad Request
```json
{
  "ok": false,
  "error": "Slug is required",
  "details": "スラッグは必須です"
}
```

#### 404 Not Found
```json
{
  "ok": false,
  "error": "Page not found",
  "details": "指定されたページが見つかりません"
}
```

#### 500 Internal Server Error
```json
{
  "ok": false,
  "error": "Failed to save page",
  "details": "ページの保存に失敗しました"
}
```

## レート制限

現在はレート制限を設けていませんが、将来的には以下の制限を実装予定です：

- リクエスト: 1000回/時間
- アップロード: 100MB/時間
- 同時接続: 100接続

## CORS設定

```javascript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

## バージョニング

現在はAPIバージョニングを実装していませんが、将来的には以下の形式で実装予定です：

```
/api/v1/contents
/api/v1/markdown
/api/v1/media
```

## セキュリティ

### 入力検証
- すべての入力パラメータの検証
- SQLインジェクション対策
- XSS対策

### ファイルアップロード
- ファイルタイプの検証
- ファイルサイズの制限
- マルウェアスキャン（将来実装）

### 認証・認可
- JWTトークンベース認証（将来実装）
- ロールベースアクセス制御（将来実装）
- APIキー認証（将来実装）
