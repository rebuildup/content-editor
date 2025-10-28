# Page Editor - 更新されたドキュメント

## 更新内容の概要

ご回答を踏まえて、以下の主要な変更を行いました：

### 1. Monaco Editorの削除とエディタブルテキストブロック形式への変更

- **変更前**: Monaco Editorベースの高機能エディター
- **変更後**: エディタブルテキストブロック形式での編集
- **影響**: より直感的でNotionライクな編集体験を提供

### 2. メディアバイナリ埋め込みの制限とパフォーマンス考慮事項の更新

- **ファイルサイズ制限**: 10MB以内に制限
- **パフォーマンス最適化**: 静的サイト生成による最適化
- **CDN/オブジェクトストレージ**: 使用しない方針

### 3. ブロックシステムのデータ構造とバージョン管理の簡素化

- **バージョン管理**: 削除
- **依存関係**: MarkdownからHTML変換時にIDを自動生成
- **データ構造**: シンプルなBlockBaseインターフェース

### 4. 状態管理の複雑性削除とプレビュー中心の設計

- **テキストエディター状態**: 実装しない
- **ブロックエディター**: プレビューと両立
- **状態切り替え**: 不要

### 5. スケジュールとリソース配分の記述削除

- **開発期間**: 関与しない
- **納期**: 考慮不要
- **リソース配分**: 削除

### 6. セキュリティとパフォーマンスの考慮事項簡素化

- **セキュリティ**: 個人使用のため考慮不要
- **パフォーマンス**: 静的ページ生成による最適化

### 7. 既存システム統合から独立システムへの変更

- **editor-home**: 統合しない
- **md-editor**: 参考のみ、必要なくなれば破棄
- **API**: 現状から動かさない

## 更新されたファイル

### 主要ドキュメント
- `docs/page-editor/README.md` - メインの概要と特徴を更新
- `docs/page-editor/architecture/system-design.md` - システム設計を更新
- `docs/page-editor/architecture/tech-stack.md` - 技術スタックを更新
- `docs/TYPE_DEFINITIONS.md` - ブロックシステムの型定義を追加

### 新しいドキュメント
- `docs/page-editor/implementation/editable-text-specifications.md` - エディタブルテキストブロックの詳細仕様
- `docs/page-editor/implementation/phases-updated.md` - 更新された実装フェーズ
- `docs/page-editor/api/independent-system-design.md` - 独立システムとしての設計

### 更新されたドキュメント
- `docs/page-editor/overview/priority.md` - 優先度と実装戦略を更新

## 技術的な変更点

### エディター基盤
```typescript
// 変更前: Monaco Editor
import { Editor } from '@monaco-editor/react';

// 変更後: エディタブルテキストブロック
import { EditableText } from './EditableText';
import { BlockEditor } from './BlockEditor';
```

### ブロックシステム
```typescript
// 簡素化されたBlockBase
interface BlockBase {
  id: string; // 自動生成される一意ID
  type: string; // ブロックタイプ
  content: string; // ブロックの内容
  attributes?: Record<string, unknown>; // ブロックの属性
  children?: BlockBase[]; // 子ブロック（ネスト構造用）
}
```

### メディア処理
```typescript
// 10MB以内の制限
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Base64エンコードによる直接埋め込み
const base64Data = await fileToBase64(file);
```

### パフォーマンス最適化
```typescript
// 静的サイト生成
export function generateStaticPages(blocks: BlockBase[]) {
  return blocks.map(block => generateStaticHTML(block));
}
```

## 実装の優先順位（更新版）

### 🚀 最優先（MVP）
1. **基本ブロック**: テキスト、見出し、リスト、引用、区切り線
2. **メディアブロック**: 画像、動画、ファイル（10MB以内）
3. **エディター基盤**: エディタブルテキストブロック、リアルタイムプレビュー

### ⚡ 高優先
1. **コールアウト**: 重要情報の強調表示
2. **WebBookmark**: URLプレビュー
3. **CodeBlock**: シンタックスハイライト

### 📈 中優先
1. **インライン機能**: メンション、ページリンク、日付
2. **応用ブロック**: 目次、トグル、数式
3. **AudioBlock**: 音声プレイヤー

### 🔮 低優先
1. **データベースブロック**: テーブル、カンバン、カレンダー
2. **埋め込みブロック**: YouTube、Googleマップ、カスタムHTML
3. **高度な機能**: コラボレーション、AI機能

## 次のステップ

1. **Phase 1**: 基盤構築（エディタブルテキストブロック、基本レイアウト）
2. **Phase 2**: メディアブロック（画像、動画、ファイル）
3. **Phase 3**: インライン機能（メンション、ページリンク、日付）
4. **Phase 4**: 応用ブロック（目次、トグル、数式）
5. **Phase 5**: データベースブロック（テーブル、カンバン、カレンダー）
6. **Phase 6**: 埋め込みブロック（YouTube、Googleマップ、カスタムHTML）

## 参考資料

- [Remark Documentation](https://remark.js.org/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [Notion Block Types](https://www.notion.so/help/blocks-and-content)
- [React ContentEditable](https://github.com/lovasoa/react-contenteditable)

---

これらの変更により、page-editorはより実用的で実装しやすいシステムとして設計されました。Monaco Editorの複雑さを排除し、エディタブルテキストブロックによる直感的な編集体験を提供します。
