# エンドポイント

## 概要

page-editorで使用するAPIエンドポイントの詳細仕様です。既存のeditor-homeのエンドポイントを基盤とし、必要に応じて拡張します。

## ベースURL

```
http://localhost:3020/api
```

## コンテンツ管理エンドポイント

### GET /api/contents

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

**ステータスコード**
- `200 OK`: 成功

### GET /api/contents?id={id}

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

**ステータスコード**
- `200 OK`: 成功
- `404 Not Found`: コンテンツが見つからない

### POST /api/contents

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

**ステータスコード**
- `201 Created`: 作成成功
- `400 Bad Request`: リクエストエラー
- `409 Conflict`: ID重複

### PUT /api/contents

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

**ステータスコード**
- `200 OK`: 更新成功
- `400 Bad Request`: リクエストエラー
- `404 Not Found`: コンテンツが見つからない

### DELETE /api/contents?id={id}

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

**ステータスコード**
- `200 OK`: 削除成功
- `404 Not Found`: コンテンツが見つからない

## マークダウンページエンドポイント

### GET /api/markdown

マークダウンページの一覧を取得します。

**クエリパラメータ**
- `contentId` (string, optional): コンテンツIDでフィルタ

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

**ステータスコード**
- `200 OK`: 成功

### GET /api/markdown?id={id}

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

**ステータスコード**
- `200 OK`: 成功
- `404 Not Found`: ページが見つからない

### POST /api/markdown

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

**ステータスコード**
- `201 Created`: 作成成功
- `400 Bad Request`: リクエストエラー
- `409 Conflict`: スラッグ重複

### PUT /api/markdown

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

**ステータスコード**
- `200 OK`: 更新成功
- `400 Bad Request`: リクエストエラー
- `404 Not Found`: ページが見つからない

### DELETE /api/markdown?id={id}

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

**ステータスコード**
- `200 OK`: 削除成功
- `404 Not Found`: ページが見つからない

## メディア管理エンドポイント

### GET /api/media

メディアファイルの一覧を取得します。

**クエリパラメータ**
- `contentId` (string, required): コンテンツID

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

**ステータスコード**
- `200 OK`: 成功
- `400 Bad Request`: contentIdが指定されていない

### GET /api/media/{id}/data

特定のメディアファイルのバイナリデータを取得します。

**リクエスト**
```http
GET /api/media/media-id-123/data
```

**レスポンス**
- **Content-Type**: メディアのMIMEタイプ（image/jpeg, video/mp4等）
- **Content**: バイナリデータ

**ステータスコード**
- `200 OK`: 成功
- `404 Not Found`: メディアが見つからない
- `500 Internal Server Error`: サーバーエラー

### GET /api/media?contentId={contentId}&id={id}

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

**ステータスコード**
- `200 OK`: 成功
- `400 Bad Request`: パラメータが不正
- `404 Not Found`: メディアが見つからない

### POST /api/media

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

**ステータスコード**
- `201 Created`: アップロード成功
- `400 Bad Request`: リクエストエラー
- `413 Payload Too Large`: ファイルサイズが大きすぎる

### DELETE /api/media?contentId={contentId}&id={id}

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

**ステータスコード**
- `200 OK`: 削除成功
- `400 Bad Request`: パラメータが不正
- `404 Not Found`: メディアが見つからない

## ブロックシステムエンドポイント（拡張予定）

### POST /api/blocks/parse

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

**ステータスコード**
- `200 OK`: 解析成功
- `400 Bad Request`: リクエストエラー

### POST /api/blocks/render

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

**ステータスコード**
- `200 OK`: レンダリング成功
- `400 Bad Request`: リクエストエラー

### POST /api/blocks/validate

ブロックの妥当性を検証します。

**リクエスト**
```json
{
  "blocks": [
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
  "valid": true,
  "errors": []
}
```

**ステータスコード**
- `200 OK`: 検証完了
- `400 Bad Request`: リクエストエラー

## 統計情報エンドポイント

### GET /api/contents/stats

コンテンツの統計情報を取得します。

**リクエスト**
```http
GET /api/contents/stats
```

**レスポンス**
```json
{
  "total": 10,
  "published": 7,
  "draft": 3,
  "archived": 0,
  "byLanguage": {
    "ja": 8,
    "en": 2
  },
  "byStatus": {
    "draft": 3,
    "published": 7
  }
}
```

**ステータスコード**
- `200 OK`: 成功

### GET /api/markdown/stats

マークダウンページの統計情報を取得します。

**リクエスト**
```http
GET /api/markdown/stats
```

**レスポンス**
```json
{
  "total": 25,
  "published": 20,
  "draft": 5,
  "archived": 0,
  "byContent": {
    "content-1": 10,
    "content-2": 15
  },
  "byLanguage": {
    "ja": 20,
    "en": 5
  }
}
```

**ステータスコード**
- `200 OK`: 成功

### GET /api/media/stats

メディアファイルの統計情報を取得します。

**リクエスト**
```http
GET /api/media/stats
```

**レスポンス**
```json
{
  "total": 50,
  "byType": {
    "image/jpeg": 30,
    "image/png": 15,
    "video/mp4": 5
  },
  "totalSize": 104857600,
  "byContent": {
    "content-1": 20,
    "content-2": 30
  }
}
```

**ステータスコード**
- `200 OK`: 成功

## エラーレスポンス

### 400 Bad Request
```json
{
  "ok": false,
  "error": "Validation failed",
  "details": {
    "field": "slug",
    "message": "Slug is required"
  }
}
```

### 404 Not Found
```json
{
  "ok": false,
  "error": "Resource not found",
  "details": "The requested resource was not found"
}
```

### 409 Conflict
```json
{
  "ok": false,
  "error": "Conflict",
  "details": "Resource already exists"
}
```

### 413 Payload Too Large
```json
{
  "ok": false,
  "error": "Payload too large",
  "details": "File size exceeds maximum allowed size"
}
```

### 500 Internal Server Error
```json
{
  "ok": false,
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

## レート制限

現在はレート制限を設けていませんが、将来的には以下の制限を実装予定です：

### 制限値
- **リクエスト**: 1000回/時間
- **アップロード**: 100MB/時間
- **同時接続**: 100接続

### レスポンスヘッダー
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### レート制限超過時のレスポンス
```json
{
  "ok": false,
  "error": "Rate limit exceeded",
  "details": "Too many requests, please try again later"
}
```

**ステータスコード**: `429 Too Many Requests`

## CORS設定

### 許可されるオリジン
```
Access-Control-Allow-Origin: *
```

### 許可されるメソッド
```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 許可されるヘッダー
```
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### プリフライトリクエスト
```http
OPTIONS /api/contents
```

**レスポンス**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

## バージョニング

現在はAPIバージョニングを実装していませんが、将来的には以下の形式で実装予定です：

### URL形式
```
/api/v1/contents
/api/v1/markdown
/api/v1/media
```

### バージョン情報
```http
GET /api/version
```

**レスポンス**
```json
{
  "version": "1.0.0",
  "apiVersion": "v1",
  "supportedVersions": ["v1"],
  "deprecatedVersions": []
}
```

## セキュリティ

### 入力検証
- すべての入力パラメータの検証
- SQLインジェクション対策
- XSS対策

### ファイルアップロード
- ファイルタイプの検証
- ファイルサイズの制限（10MB）
- マルウェアスキャン（将来実装）

### 認証・認可
- JWTトークンベース認証（将来実装）
- ロールベースアクセス制御（将来実装）
- APIキー認証（将来実装）

### セキュリティヘッダー
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
