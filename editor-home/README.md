# Editor Home - コンテンツ管理システム

SQLite ベースのコンテンツ管理システムの Next.js アプリケーション。

## 🚀 開発サーバーの起動

```bash
pnpm install
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

## 📂 ページ構成

- `/` - コンテンツ管理
- `/markdown` - Markdownページ管理
- `/media` - メディア（画像）管理
- `/databases` - データベース管理（旧システム）

## 🗄️ データベース

データは `data/` ディレクトリに保存されます：

```
data/
├── contents/           # コンテンツごとの個別DBファイル
│   ├── content-apple01.db
│   ├── content-banana02.db
│   └── content-orange03.db
└── index.db            # インデックスDB
```

## 📚 ドキュメント

包括的なドキュメントはプロジェクトルートの [`docs/`](../docs/) ディレクトリにあります：

- [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) - データベース構造
- [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md) - REST API 仕様
- [TYPE_DEFINITIONS.md](../docs/TYPE_DEFINITIONS.md) - TypeScript 型定義
- [SETUP_GUIDE.md](../docs/SETUP_GUIDE.md) - セットアップと移行ガイド
- [EXAMPLES.md](../docs/EXAMPLES.md) - 使用例とサンプルコード

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **データベース**: SQLite3 (better-sqlite3)
- **UI**: shadcn/ui, Tailwind CSS
- **アイコン**: Lucide Icons
- **リンター**: Biome
- **パッケージマネージャー**: pnpm

## 🔧 ビルド

```bash
# 本番ビルド
pnpm build

# ビルドを起動
pnpm start
```

## 📖 参考資料

詳細はプロジェクトルートの [README.md](../README.md) を参照してください。
