# MD Editor - Yoopta リッチテキストエディタ

Notion風のリッチテキストエディタアプリケーション（独立プロジェクト）。

## 🚀 開発サーバーの起動

```bash
pnpm install
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

## 📝 概要

このプロジェクトは [Yoopta-Editor](https://github.com/yoopta-editor/Yoopta-Editor) を使用したリッチテキストエディタです。  
Notion、Craft、Medium のような編集体験を提供します。

### 主な機能

- 豊富なテキストフォーマット（太字、斜体、下線、ハイライトなど）
- 見出し（H1、H2、H3）
- リスト（番号付き、箇条書き、TODO）
- コードブロック
- 引用
- テーブル
- アコーディオン
- 画像・動画・ファイルの埋め込み
- リンク
- カラウト
- 区切り線
- 外部コンテンツの埋め込み

### エディタの使い方

- `/` キーでアクションメニューを開く
- テキストを選択してツールバーを表示
- スラッシュコマンドで様々なブロックを挿入

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **エディタ**: Yoopta-Editor v4.9.9
- **UI**: Tailwind CSS
- **言語**: TypeScript
- **パッケージマネージャー**: pnpm

### Yoopta-Editor パッケージ

- `@yoopta/editor` - コアエディタ
- プラグイン: paragraph, blockquote, headings, lists, code, link, image, video, file, callout, divider, table, accordion, embed
- ツール: toolbar, action-menu-list, link-tool
- マーク: Bold, Italic, Code, Underline, Strike, Highlight

## 📖 参考資料

- [Yoopta-Editor 公式ドキュメント](https://yoopta.dev/)
- [Yoopta-Editor GitHub](https://github.com/yoopta-editor/Yoopta-Editor)
- メインのコンテンツ管理システムについては、プロジェクトルートの [README.md](../README.md) を参照してください。
