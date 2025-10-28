# Page Editor CMS

Notionライクなブロックシステムを持つMarkdown CMSエディター

## 概要

page-editorは、標準のMarkdown記述に加えてコンポーネントタグ形式での拡張機能を提供するCMSエディターです。editor-homeとは独立したページ作成システムとして、Notionの主要なブロック機能を再現します。

### 既存システムとの関係

- **editor-home**: コンテンツデータ全体を管理するメインシステム（ポート3020）
- **md-editor**: Markdownファイルを編集するエディター（ポート3021）
- **page-editor**: 記事データのMarkdownを編集する独立したエディター（ポート3022）

page-editorは、editor-homeのAPIを使用してデータの保存・読み込みを行いますが、editor-homeとは密接な関係はありません。

## 特徴

- **Notionライクなブロックシステム**: テキスト、メディア、データベース、埋め込みブロック
- **EditableText**: 各ブロックが独立した編集可能なテキスト要素
- **リアルタイムプレビュー**: ブロック編集とプレビューの同期
- **独立システム**: editor-homeとは独立したページ作成システム
- **手動保存**: ユーザーが明示的に保存操作を実行
- **メディアAPI連携**: 画像・動画をAPI経由で取得・表示
- **UI移植**: エディター部分以外はmd-editorから移植
- **Markdown記法保持**: `# タイトル`のような記法を保持した表示
- **スラッシュメニュー**: `/`入力でブロック挿入メニュー（自前実装）
- **静的サイト生成**: パフォーマンス最適化のための静的ページ生成

## ドキュメント構成

### 📋 [概要](./overview/)
- [プロジェクト概要](./overview/README.md)
- [Notionブロック機能分析](./overview/notion-blocks.md)
- [実装優先度](./overview/priority.md)

### 🏗️ [アーキテクチャ](./architecture/)
- [システム設計](./architecture/system-design.md)
- [データ構造](./architecture/data-structure.md)
- [技術スタック](./architecture/tech-stack.md)

### 🔧 [実装](./implementation/)
- [実装フェーズ](./implementation/phases.md)
- [開発スケジュール](./implementation/schedule.md)
- [詳細仕様](./implementation/specifications.md)

### 🔌 [API](./api/)
- [API仕様](./api/README.md)
- [データ連携](./api/integration.md)
- [エンドポイント](./api/endpoints.md)

### 🧩 [ブロック](./blocks/)
- [ブロック仕様](./blocks/README.md)
- [基本ブロック](./blocks/basic.md)
- [メディアブロック](./blocks/media.md)
- [応用ブロック](./blocks/advanced.md)
- [データベースブロック](./blocks/database.md)
- [埋め込みブロック](./blocks/embed.md)


## クイックスタート

### 前提条件
- Node.js 18+
- pnpm
- editor-homeが起動済み

### セットアップ
```bash
cd page-editor
pnpm install
pnpm dev
```

### 基本的な使い方
1. editor-homeでコンテンツを作成
2. page-editorでMarkdownを編集
3. ブロックを追加・編集
4. リアルタイムプレビューで確認
5. 手動保存でデータを保存

## 実装の優先順位

### 🚀 最優先（MVP）
1. **レイアウトブロック**: SpacerBlock（空行・余白）
2. **メディアブロック**: ImageBlock、VideoBlock、AudioBlock
3. **EditableText**: ブロック単位の編集機能
4. **リアルタイムプレビュー**: ブロック編集とプレビューの同期

### ⚡ 高優先
1. **CustomBlock**: カスタムHTML埋め込み
2. **MathBlock**: TeX数式表示
3. **スラッシュメニュー**: ブロック挿入メニュー

### 📈 中優先
1. **UI移植**: md-editorからのUI移植
2. **手動保存**: 保存ボタンとキーボードショートカット
3. **メディアAPI連携**: editor-homeとの連携

### 🔮 低優先
1. **高度な機能**: ブロックの拡張機能
2. **最適化**: パフォーマンス向上
3. **静的サイト生成**: 公開時の最適化

## 参考資料

- [Remark Documentation](https://remark.js.org/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [Notion Block Types](https://www.notion.so/help/blocks-and-content)
- [React ContentEditable](https://github.com/lovasoa/react-contenteditable)

## ライセンス

MIT License
