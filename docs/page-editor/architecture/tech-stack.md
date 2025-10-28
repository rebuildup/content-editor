# 技術スタック

## 概要

page-editorの技術スタックは、editor-homeとは独立したページ作成システムとして、ブロックシステムの実装に最適化された構成です。

## フロントエンド技術

### 1. コアフレームワーク

#### Next.js 16
- **App Router**: 最新のルーティングシステム
- **Server Components**: サーバーサイドレンダリング
- **API Routes**: バックエンドAPI実装
- **Middleware**: リクエスト処理のカスタマイズ

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/vite"],
          as: "*.css",
        },
      },
    },
  },
};

export default nextConfig;
```

#### React 19
- **Concurrent Features**: 並行レンダリング
- **Suspense**: 非同期コンポーネント
- **Hooks**: 状態管理とライフサイクル
- **Context API**: グローバル状態管理

### 2. 型安全性

#### TypeScript 5
- **厳密な型チェック**: コンパイル時エラー検出
- **型推論**: 自動的な型推論
- **ジェネリクス**: 再利用可能な型定義
- **ユーティリティ型**: 組み込み型の活用

```typescript
// 型定義例
interface BlockBase {
  id: string;
  type: string;
  content: string;
  attributes?: Record<string, unknown>;
}

type BlockType = "text" | "heading" | "image" | "video";
type BlockWithType<T extends BlockType> = BlockBase & { type: T };
```

### 3. スタイリング

#### Tailwind CSS v4
- **ユーティリティファースト**: 効率的なスタイリング
- **レスポンシブデザイン**: モバイルファースト
- **ダークモード**: 自動的なテーマ切り替え
- **カスタムCSS**: 必要に応じた拡張

```css
/* globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### 4. エディター

#### React ContentEditable
- **エディタブルテキスト**: ブロック単位の編集
- **イベントハンドリング**: 入力イベントの処理
- **フォーカス管理**: フォーカス状態の管理
- **アクセシビリティ**: スクリーンリーダー対応

```typescript
import { useRef, useEffect } from 'react';

export function EditableText({ value, onChange }: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);
  
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    onChange(newValue);
  };
  
  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      className="min-h-[1.5rem] focus:outline-none"
      suppressContentEditableWarning
    />
  );
}
```

## バックエンド技術

### 1. API サーバー

#### Next.js API Routes
- **RESTful API**: 標準的なAPI設計
- **Middleware**: 認証・認可処理
- **エラーハンドリング**: 統一的なエラー処理
- **CORS**: クロスオリジン対応

```typescript
// app/api/markdown/route.ts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (id) {
      const page = getMarkdownPage(db, id);
      if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404 });
      }
      return Response.json(page);
    }
    
    // 一覧取得処理
    const pages = getAllMarkdownPages(db);
    return Response.json(pages);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch markdown pages" },
      { status: 500 }
    );
  }
}
```

### 2. データベース

#### SQLite
- **軽量**: ファイルベースデータベース
- **高速**: ローカルアクセス
- **移植性**: プラットフォーム非依存
- **ACID**: トランザクション保証

#### Better SQLite3
- **高性能**: ネイティブバインディング
- **同期API**: シンプルな操作
- **プリペアドステートメント**: SQLインジェクション対策
- **トランザクション**: データ整合性保証

```typescript
import Database from 'better-sqlite3';

const db = new Database('content.db');

// プリペアドステートメント
const getPage = db.prepare('SELECT * FROM markdown_pages WHERE id = ?');
const insertPage = db.prepare(`
  INSERT INTO markdown_pages (id, slug, frontmatter, body, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// トランザクション
const insertPageWithTransaction = db.transaction((page) => {
  insertPage.run(page.id, page.slug, page.frontmatter, page.body, page.createdAt, page.updatedAt);
});
```

## ライブラリ・ツール

### 1. Markdown処理

#### Remark
- **プラグインシステム**: 拡張可能な処理
- **AST**: 抽象構文木による操作
- **変換**: Markdown ↔ HTML
- **検証**: 構文チェック

```typescript
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';

const processor = remark()
  .use(remarkGfm) // GitHub Flavored Markdown
  .use(remarkHtml); // HTML変換

const html = await processor.process(markdown);
```

#### Prism.js
- **シンタックスハイライト**: コードの色分け
- **多言語対応**: 200+言語
- **テーマ**: カスタマイズ可能
- **軽量**: 必要な言語のみ読み込み

```typescript
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

// コードハイライト
const highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');
```

### 2. 数式処理

#### MathJax
- **数式表示**: TeX数式のレンダリング
- **インライン数式**: 文中での数式表示
- **ブロック数式**: 独立した数式ブロック

```typescript
import { MathJax } from 'react-mathjax';

const MathBlock = ({ formula }: { formula: string }) => (
  <MathJax.Provider>
    <MathJax.Node formula={formula} />
  </MathJax.Provider>
);
```

### 3. ファイル処理

#### React Dropzone
- **ファイル選択**: 直感的なファイルアップロード
- **ファイル検証**: タイプ・サイズチェック
- **プレビュー**: 画像プレビュー
- **進捗表示**: アップロード進捗

```typescript
import { useDropzone } from 'react-dropzone';

function FileUpload({ onUpload }: FileUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => {
      files.forEach(file => onUpload(file));
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>ファイルをクリックして選択</p>
    </div>
  );
}
```

### 4. アイコン・UI

#### Lucide React
- **一貫性**: 統一されたデザイン
- **軽量**: 必要なアイコンのみ
- **カスタマイズ**: サイズ・色の調整
- **アクセシビリティ**: ARIA属性対応

```typescript
import { FileText, Image, Video, Code, Save } from 'lucide-react';

function BlockToolbar() {
  return (
    <div className="toolbar">
      <button><FileText size={16} /></button>
      <button><Image size={16} /></button>
      <button><Video size={16} /></button>
      <button><Code size={16} /></button>
      <button><Save size={16} /></button>
    </div>
  );
}
```

### 5. 日付処理

#### date-fns
- **軽量**: 必要な関数のみ
- **型安全**: TypeScript対応
- **関数型**: 純粋関数
- **多言語**: 国際化対応

```typescript
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付フォーマット
const formattedDate = format(new Date(), 'yyyy年MM月dd日', { locale: ja });

// 日付検証
const isValidDate = isValid(parseISO(dateString));
```

### 6. URL処理

#### url-metadata
- **メタデータ取得**: サイト情報の自動取得
- **OGP対応**: Open Graph Protocol
- **Twitter Cards**: Twitter用メタデータ
- **画像取得**: サムネイル画像

```typescript
import urlMetadata from 'url-metadata';

async function getUrlMetadata(url: string) {
  try {
    const metadata = await urlMetadata(url);
    return {
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      url: metadata.url,
    };
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return null;
  }
}
```

## 開発ツール

### 1. コード品質

#### Biome
- **高速**: Rust製の高速リンター
- **統合**: フォーマッター + リンター
- **設定**: 最小限の設定
- **TypeScript**: 完全対応

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

### 2. パッケージ管理

#### pnpm
- **高速**: 効率的なパッケージ管理
- **ディスク効率**: ハードリンクによる省容量
- **厳密**: phantom dependenciesの防止
- **互換性**: npm互換

```bash
# パッケージインストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build
```

### 3. 型チェック

#### TypeScript
- **厳密モード**: 最大限の型安全性
- **パスエイリアス**: インポートパスの短縮
- **型生成**: 自動的な型生成

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

## 監視・ログ

### 1. エラー監視

#### Sentry
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// エラーキャッチ
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```
