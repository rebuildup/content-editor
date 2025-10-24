# セットアップ＆移行ガイド

このドキュメントは、コンテンツ管理システムを新しいプロジェクトにセットアップする方法と、既存データを移行する方法を説明します。

## 目次

1. [新規プロジェクトへのセットアップ](#新規プロジェクトへのセットアップ)
2. [データベースの移行](#データベースの移行)
3. [API統合](#api統合)
4. [トラブルシューティング](#トラブルシューティング)

---

## 新規プロジェクトへのセットアップ

### 前提条件

- Node.js 18.x 以上
- pnpm 8.x 以上（または npm/yarn）
- SQLite3 サポート

### 1. 必要なパッケージのインストール

```bash
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3
```

### 2. ディレクトリ構造の作成

プロジェクトルートに以下のディレクトリ構造を作成：

```
your-project/
├── app/
│   ├── api/
│   │   ├── contents/
│   │   │   ├── route.ts
│   │   │   └── stats/
│   │   │       └── route.ts
│   │   ├── markdown/
│   │   │   ├── route.ts
│   │   │   └── stats/
│   │   │       └── route.ts
│   │   ├── media/
│   │   │   ├── route.ts
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   └── import-public/
│   │   │       └── route.ts
│   │   └── databases/
│   │       ├── route.ts
│   │       └── stats/
│   │           └── route.ts
│   └── lib/
│       ├── db.ts
│       ├── content-db-manager.ts
│       ├── content-mapper.ts
│       ├── media-manager.ts
│       └── markdown-mapper.ts
├── types/
│   ├── common.ts
│   ├── content.ts
│   ├── markdown.ts
│   ├── media.ts
│   ├── seo.ts
│   └── database.ts
└── data/
    ├── contents/        # コンテンツDBファイル保存先
    └── index.db         # インデックスDB
```

### 3. ファイルのコピー

このプロジェクトから以下のファイルをコピー：

#### 型定義ファイル（types/）
- `common.ts`
- `content.ts`
- `markdown.ts`
- `media.ts`
- `seo.ts`
- `database.ts`

#### ライブラリファイル（app/lib/）
- `db.ts` - データベース接続とスキーマ定義
- `content-db-manager.ts` - コンテンツDB管理
- `content-mapper.ts` - データマッパー
- `media-manager.ts` - メディア管理
- `markdown-mapper.ts` - Markdownマッパー

#### APIルート（app/api/）
- `contents/route.ts`
- `contents/stats/route.ts`
- `markdown/route.ts`
- `markdown/stats/route.ts`
- `media/route.ts`
- `media/stats/route.ts`
- `media/import-public/route.ts`
- `databases/route.ts`
- `databases/stats/route.ts`

### 4. 環境変数の設定（オプション）

`.env.local` ファイルを作成：

```env
# データベースディレクトリ（デフォルト: ./data）
DB_DIR=./data

# データベースモード（デフォルト: WAL）
DB_MODE=WAL
```

### 5. データディレクトリの作成

```bash
mkdir -p data/contents
```

### 6. 権限の設定

データディレクトリに書き込み権限があることを確認：

```bash
chmod -R 755 data
```

### 7. 初期化スクリプトの実行（オプション）

データベーススキーマの初期化：

```typescript
// scripts/init-db.ts
import { getContentDb } from '@/app/lib/content-db-manager';

// サンプルコンテンツを作成してスキーマを初期化
const db = getContentDb('sample-content');
db.close();

console.log('Database initialized successfully!');
```

```bash
ts-node scripts/init-db.ts
```

---

## データベースの移行

### 既存データベースからの移行

#### 方法1: ファイルコピー

最も簡単な方法は、データベースファイルをそのままコピー：

```bash
# 1. 元のプロジェクトのdataディレクトリをコピー
cp -r /path/to/old-project/data /path/to/new-project/

# 2. 権限を設定
chmod -R 755 /path/to/new-project/data
```

#### 方法2: エクスポート/インポート

特定のコンテンツのみを移行：

```bash
# 1. 元のプロジェクトから特定のDBファイルをコピー
cp /path/to/old-project/data/contents/content-apple01.db \
   /path/to/new-project/data/contents/

# 2. インデックスDBも移行する場合
cp /path/to/old-project/data/index.db \
   /path/to/new-project/data/
```

#### 方法3: JSON経由でのエクスポート/インポート

異なるシステム間での移行：

**エクスポートスクリプト**:
```typescript
// scripts/export-content.ts
import { getContentDb } from '@/app/lib/content-db-manager';
import { getFullContent } from '@/app/lib/content-mapper';
import { listMedia } from '@/app/lib/media-manager';
import fs from 'fs';

const contentId = 'apple01';
const db = getContentDb(contentId);

// コンテンツデータを取得
const content = getFullContent(db, contentId);

// メディアデータを取得
const mediaList = listMedia(contentId);

// 各メディアのバイナリデータを取得
const mediaWithData = await Promise.all(
  mediaList.map(async (media) => {
    const fullMedia = await getMedia(contentId, media.id);
    return {
      ...media,
      base64: fullMedia?.data?.toString('base64')
    };
  })
);

// エクスポートデータを作成
const exportData = {
  content,
  media: mediaWithData,
  exportedAt: new Date().toISOString(),
  version: '1.0'
};

// JSONファイルに保存
fs.writeFileSync(
  `export-${contentId}.json`,
  JSON.stringify(exportData, null, 2)
);

db.close();
console.log(`Exported ${contentId} to export-${contentId}.json`);
```

**インポートスクリプト**:
```typescript
// scripts/import-content.ts
import { getContentDb } from '@/app/lib/content-db-manager';
import { saveFullContent } from '@/app/lib/content-mapper';
import { saveMedia } from '@/app/lib/media-manager';
import fs from 'fs';

const filename = 'export-apple01.json';
const exportData = JSON.parse(fs.readFileSync(filename, 'utf-8'));

const db = getContentDb(exportData.content.id);

// コンテンツをインポート
saveFullContent(db, exportData.content);

// メディアをインポート
for (const media of exportData.media) {
  if (media.base64) {
    saveMedia(exportData.content.id, {
      ...media,
      data: Buffer.from(media.base64, 'base64')
    });
  }
}

db.close();
console.log(`Imported ${exportData.content.id}`);
```

### スキーマのバージョン管理

データベーススキーマが変更された場合のマイグレーション：

```typescript
// scripts/migrate-schema.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const contentsDir = path.join(process.cwd(), 'data', 'contents');
const files = fs.readdirSync(contentsDir).filter(f => f.endsWith('.db'));

for (const file of files) {
  const dbPath = path.join(contentsDir, file);
  const db = new Database(dbPath);
  
  // スキーマバージョンを確認
  const version = db.pragma('user_version', { simple: true }) as number;
  
  if (version < 1) {
    // マイグレーション例: 新しいカラムを追加
    db.exec(`
      ALTER TABLE contents ADD COLUMN new_field TEXT;
    `);
    db.pragma('user_version = 1');
    console.log(`Migrated ${file} to version 1`);
  }
  
  db.close();
}
```

---

## API統合

### Next.js プロジェクトでの使用

#### 1. API ルートの設定

`app/api/contents/route.ts` を作成（上記参照）

#### 2. フロントエンドから呼び出し

```typescript
// コンテンツ一覧取得
const fetchContents = async () => {
  const response = await fetch('/api/contents');
  const data = await response.json();
  return data;
};

// コンテンツ作成
const createContent = async (content: Partial<Content>) => {
  const response = await fetch('/api/contents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });
  return await response.json();
};

// 画像アップロード
const uploadImage = async (contentId: string, file: File) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = (e.target?.result as string).split(',')[1];
    
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId,
        filename: file.name,
        mimeType: file.type,
        base64Data: base64
      })
    });
    return await response.json();
  };
  reader.readAsDataURL(file);
};
```

### 他のフレームワークでの使用

#### Express.js での使用例

```typescript
import express from 'express';
import { getContentDb } from './lib/content-db-manager';
import { getFullContent, saveFullContent } from './lib/content-mapper';

const app = express();
app.use(express.json());

// コンテンツ一覧取得
app.get('/api/contents', (req, res) => {
  const contents = getAllFromIndex();
  res.json(contents);
});

// コンテンツ詳細取得
app.get('/api/contents/:id', (req, res) => {
  const db = getContentDb(req.params.id);
  const content = getFullContent(db, req.params.id);
  db.close();
  
  if (!content) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json(content);
});

// コンテンツ作成
app.post('/api/contents', (req, res) => {
  const db = getContentDb(req.body.id);
  saveFullContent(db, req.body);
  db.close();
  
  res.json({ ok: true, id: req.body.id });
});

app.listen(3000);
```

---

## トラブルシューティング

### 問題: "no such table" エラー

**原因**: データベーススキーマが初期化されていない

**解決策**:
```bash
# データベースファイルを削除して再作成
rm data/contents/content-*.db
# アプリケーションを再起動してスキーマを再作成
```

### 問題: "database is locked" エラー

**原因**: 複数プロセスが同時にDBにアクセスしている

**解決策**:
```typescript
// WALモードを有効化（db.ts）
db.pragma('journal_mode = WAL');

// タイムアウトを設定
db.pragma('busy_timeout = 5000');
```

### 問題: 画像が表示されない

**原因**: Base64エンコードが正しくない、またはBLOBデータが破損

**解決策**:
```typescript
// 画像データの検証
const media = getMedia(contentId, mediaId);
if (!media?.data) {
  console.error('Media data is missing');
}

// Base64変換を確認
const base64 = media.data.toString('base64');
console.log('Base64 length:', base64.length);
```

### 問題: パフォーマンスが遅い

**原因**: インデックスが不足している、またはクエリが非効率

**解決策**:
```sql
-- 必要なインデックスを追加
CREATE INDEX IF NOT EXISTS idx_custom ON table_name(column_name);

-- ANALYZE を実行してクエリプランナーを最適化
ANALYZE;
```

### 問題: ファイルサイズが大きくなりすぎる

**原因**: 画像データが大量、またはVACUUMが必要

**解決策**:
```typescript
// 定期的にVACUUMを実行
import Database from 'better-sqlite3';

const db = new Database('data/contents/content-apple01.db');
db.exec('VACUUM');
db.close();
```

### 問題: Windows で better-sqlite3 がビルドできない

**解決策**:
```bash
# node-gyp の依存関係をインストール
npm install -g node-gyp
npm install -g windows-build-tools

# better-sqlite3 を再ビルド
pnpm rebuild better-sqlite3
```

---

## 本番環境への展開

### 1. 環境変数の設定

```env
NODE_ENV=production
DB_DIR=/var/lib/content-db/data
```

### 2. パーミッションの設定

```bash
# データディレクトリの所有者を設定
chown -R www-data:www-data /var/lib/content-db/data

# 適切な権限を設定
chmod -R 750 /var/lib/content-db/data
```

### 3. バックアップの自動化

```bash
# cron ジョブ例（毎日午前2時にバックアップ）
0 2 * * * tar -czf /backup/content-db-$(date +\%Y\%m\%d).tar.gz /var/lib/content-db/data
```

### 4. モニタリング

```typescript
// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  try {
    const db = new Database('data/index.db');
    const result = db.prepare('SELECT 1').get();
    db.close();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

---

## 参考資料

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - データベーススキーマ仕様
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - API仕様
- [TYPE_DEFINITIONS.md](./TYPE_DEFINITIONS.md) - 型定義仕様
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)

