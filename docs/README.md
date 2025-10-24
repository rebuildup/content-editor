# コンテンツ管理システム - ドキュメント

このディレクトリには、コンテンツ管理システムの包括的なドキュメントが含まれています。

## 📚 ドキュメント一覧

### 1. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
データベース構造の完全な仕様。

**内容:**
- SQLiteスキーマ定義
- テーブル構造（contents, markdown_pages, media など）
- インデックスと外部キー制約
- JSON列の形式
- ファイル構造

### 2. [API_SPECIFICATION.md](./API_SPECIFICATION.md)
REST API の完全な仕様。

**内容:**
- コンテンツ API（CRUD操作）
- Markdown API
- メディア API（画像アップロード、取得）
- データベース管理 API
- リクエスト/レスポンス例
- エラーハンドリング

### 3. [TYPE_DEFINITIONS.md](./TYPE_DEFINITIONS.md)
TypeScript 型定義の詳細。

**内容:**
- Content, MarkdownPage, MediaItem 型
- 共通型（AssetRef, ContentLink, SearchOptions など）
- SEO 型
- データベース型
- 使用例とベストプラクティス

### 4. [SETUP_GUIDE.md](./SETUP_GUIDE.md)
セットアップと移行の手順書。

**内容:**
- 新規プロジェクトへのセットアップ手順
- データベース移行方法
- API統合方法
- トラブルシューティング
- 本番環境への展開

### 5. [EXAMPLES.md](./EXAMPLES.md)
具体的な使用例とサンプルコード。

**内容:**
- 基本的なCRUD操作
- 画像の取り扱い（アップロード、表示）
- Markdownページの管理
- 検索機能の実装
- データベース管理
- 高度な使用例（バージョニング、多言語対応）
- React フック例

### 📋 参考資料

- **[editor-home-design.md](./editor-home-design.md)** - 初期設計ドキュメント
- **[reference/](./reference/)** - 元の型定義参照（実装は `editor-home/types/` にあります）

---

## 🚀 クイックスタート

### 前提条件

```bash
# Node.js 18.x 以上
node -v

# pnpm（または npm/yarn）
pnpm -v
```

### インストール

```bash
# 依存パッケージをインストール
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3

# データディレクトリを作成
mkdir -p data/contents
```

### 基本的な使い方

```typescript
// 1. コンテンツを作成
const content = {
  id: 'my-content',
  title: 'サンプルコンテンツ',
  summary: 'これはサンプルです'
};

await fetch('/api/contents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(content)
});

// 2. 画像をアップロード
const file = document.querySelector('input[type="file"]').files[0];
const reader = new FileReader();
reader.onload = async (e) => {
  const base64 = (e.target.result as string).split(',')[1];
  
  await fetch('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId: 'my-content',
      filename: file.name,
      mimeType: file.type,
      base64Data: base64
    })
  });
};
reader.readAsDataURL(file);

// 3. コンテンツ一覧を取得
const response = await fetch('/api/contents');
const contents = await response.json();
```

---

## 🏗️ アーキテクチャ概要

### データベース構造

```
data/
├── contents/
│   ├── content-{id}.db    # コンテンツごとの個別データベース
│   ├── content-{id}.db    # 各DBには完全なスキーマが含まれる
│   └── ...
└── index.db               # 全コンテンツの高速検索用インデックス
```

### 主要コンポーネント

#### 1. データベース層
- **content-db-manager.ts**: コンテンツDBの作成・管理
- **content-mapper.ts**: TypeScript ↔ SQLite データマッピング
- **media-manager.ts**: メディア（画像）管理
- **markdown-mapper.ts**: Markdown データマッピング

#### 2. API層
- **/api/contents**: コンテンツ CRUD
- **/api/markdown**: Markdown ページ CRUD
- **/api/media**: メディアアップロード・取得
- **/api/databases**: データベース管理

#### 3. 型定義層
- **types/common.ts**: 共通型
- **types/content.ts**: コンテンツ型
- **types/markdown.ts**: Markdown型
- **types/media.ts**: メディア型
- **types/seo.ts**: SEO型
- **types/database.ts**: データベース型

---

## 💡 主要機能

### ✅ コンテンツごとに個別データベース
- ファイル命名規則: `content-{id}.db`
- 完全な独立性とポータビリティ
- コンテンツ単位でバックアップ・移動可能

### ✅ 画像のバイナリ保存
- SQLite の BLOB 型で保存
- データベースファイルに画像を含めて移行可能
- 外部ファイルシステム不要

### ✅ Markdown サポート
- フロントマター対応
- 全文検索（FTS5）
- HTML キャッシュ
- 統計情報（文字数、単語数など）

### ✅ 全文検索
- SQLite FTS5 による高速検索
- コンテンツ本文、タイトル、要約を検索
- Markdown 本文の検索

### ✅ 多言語対応
- `lang` フィールドで言語指定
- `i18n` オブジェクトで翻訳管理

### ✅ SEO 最適化
- メタタグ（title, description）
- Open Graph 対応
- Twitter Card 対応
- 構造化データ

### ✅ バージョニング
- バージョン番号管理
- 編集履歴
- 前バージョンへの参照

### ✅ アクセス制御
- 読み取り権限
- 編集権限
- オーナー管理

---

## 📊 データフロー

### コンテンツ作成フロー

```
1. クライアント
   ↓ POST /api/contents
2. API (contents/route.ts)
   ↓ saveFullContent()
3. content-mapper.ts
   ↓ contentToRow()
4. content-db-manager.ts
   ↓ getContentDb()
5. SQLite (content-{id}.db)
   ↓ INSERT
6. index.db
   ↓ addToIndex()
7. レスポンス返却
```

### 画像アップロードフロー

```
1. クライアント（ファイル選択）
   ↓ FileReader.readAsDataURL()
2. Base64 エンコード
   ↓ POST /api/media
3. API (media/route.ts)
   ↓ Buffer.from(base64)
4. media-manager.ts
   ↓ saveMedia()
5. SQLite BLOB
   ↓ INSERT INTO media
6. レスポンス返却
```

### 画像表示フロー

```
1. クライアント
   ↓ GET /api/media?contentId=xxx&id=yyy
2. API (media/route.ts)
   ↓ getMedia()
3. media-manager.ts
   ↓ SELECT data FROM media
4. SQLite BLOB → Buffer
   ↓ Buffer.toString('base64')
5. Base64 文字列
   ↓ JSON レスポンス
6. クライアント（img src="data:image/...base64...")
```

---

## 🔧 カスタマイズ例

### 1. カスタムフィールドの追加

```typescript
// types/content.ts を拡張
interface BlogContent extends Content {
  excerpt?: string;
  readingTime?: number;
  featuredImage?: AssetRef;
}

// マイグレーション
db.exec(`
  ALTER TABLE contents ADD COLUMN excerpt TEXT;
  ALTER TABLE contents ADD COLUMN reading_time INTEGER;
`);
```

### 2. 独自のリレーションタイプ

```typescript
// content_relations テーブルを活用
const relation = {
  sourceId: 'article-1',
  targetId: 'author-1',
  type: 'written-by',  // カスタムタイプ
  weight: 1.0
};
```

### 3. カスタムメタデータ

```typescript
// ext フィールドを使用
const content = {
  id: 'my-content',
  title: 'タイトル',
  ext: {
    customField1: 'value1',
    customField2: { nested: 'value2' }
  }
};
```

---

## 🧪 テスト

### 単体テスト例

```typescript
import { getContentDb } from '@/app/lib/content-db-manager';
import { saveFullContent, getFullContent } from '@/app/lib/content-mapper';

describe('Content Management', () => {
  it('should save and retrieve content', () => {
    const testContent = {
      id: 'test-content',
      title: 'Test Title',
      summary: 'Test Summary'
    };
    
    const db = getContentDb('test-content');
    saveFullContent(db, testContent);
    
    const retrieved = getFullContent(db, 'test-content');
    expect(retrieved?.title).toBe('Test Title');
    
    db.close();
  });
});
```

---

## 🔒 セキュリティ

### 推奨事項

1. **SQL Injection 対策**: プリペアドステートメント使用（実装済み）
2. **ファイル名サニタイズ**: 特殊文字除去（実装済み）
3. **ファイルサイズ制限**: アップロードサイズを制限
4. **認証・認可**: JWT 等を追加実装
5. **HTTPS**: 本番環境では必須
6. **レート制限**: API呼び出しの制限を実装

---

## 📈 パフォーマンス最適化

### 推奨設定

```typescript
// WAL モード（実装済み）
db.pragma('journal_mode = WAL');

// 同期モード
db.pragma('synchronous = NORMAL');

// キャッシュサイズ
db.pragma('cache_size = -64000');  // 64MB

// メモリマップサイズ
db.pragma('mmap_size = 268435456');  // 256MB
```

### インデックス最適化

```sql
-- 頻繁に検索するフィールドにインデックス
CREATE INDEX IF NOT EXISTS idx_custom ON table_name(column);

-- 統計情報を更新
ANALYZE;
```

---

## 📝 ライセンス

このドキュメントとコードは、プロジェクトのライセンスに従います。

---

## 🤝 コントリビューション

改善提案やバグ報告は Issue または Pull Request でお願いします。

---

## 📞 サポート

質問や問題がある場合は、以下を参照してください：

1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) のトラブルシューティング
2. [API_SPECIFICATION.md](./API_SPECIFICATION.md) のエラーハンドリング
3. プロジェクトの Issue トラッカー

---

## 🔄 バージョン履歴

### v1.0.0 (2025-10-24)
- 初版リリース
- コンテンツ管理機能
- Markdown サポート
- メディア管理（画像のバイナリ保存）
- データベース管理機能
- 全文検索（FTS5）

---

**最終更新**: 2025年10月24日

