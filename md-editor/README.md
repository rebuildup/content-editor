# Markdown Editor (md-editor)

editor-homeのデータ構造に対応したマークダウンエディタです。

## 機能

- **リッチテキストエディタ**: Yoopta Editorを使用したNotion風のエディタ
- **コンテンツ管理**: editor-homeで作成したコンテンツに記事を紐付け
- **メディア管理**: 画像や動画をバイナリでデータベースに保存
- **マークダウン変換**: エディタの内容を自動的にマークダウンに変換
- **データ永続化**: editor-homeのSQLiteデータベースに保存

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成して、editor-homeのURLを設定します：

```bash
cp .env.local.example .env.local
```

`.env.local`:
```
NEXT_PUBLIC_EDITOR_HOME_URL=http://localhost:3000
```

### 3. editor-homeを起動

まずeditor-homeを起動しておく必要があります：

```bash
cd ../editor-home
pnpm dev
```

editor-homeは`http://localhost:3000`で起動します。

### 4. md-editorを起動

別のターミナルでmd-editorを起動：

```bash
cd md-editor
pnpm dev
```

md-editorは`http://localhost:3001`で起動します。

## 使い方

### 1. コンテンツの選択

サイドバーから、記事を紐付けたいコンテンツを選択します。
コンテンツはeditor-homeであらかじめ作成しておく必要があります。

### 2. 記事の作成

1. タイトルとスラッグを入力
2. エディタで記事を執筆
3. 「保存」ボタンをクリック

### 3. メディアのアップロード

1. コンテンツを選択
2. 「メディア管理」セクションで「画像・動画をアップロード」をクリック
3. ファイルを選択
4. アップロード完了後、ギャラリーから挿入

メディアはコンテンツデータベースの`media`テーブルにバイナリで保存されます。

### 4. 記事の読み込み

1. スラッグを入力
2. 「スラッグで読み込み」ボタンをクリック
3. 既存の記事が読み込まれます

## データ構造

### マークダウンページ

`markdown_pages`テーブルに保存されます：

- `id`: ページID
- `content_id`: 紐付けられたコンテンツID
- `slug`: URLスラッグ
- `frontmatter`: メタデータ（JSON）
- `body`: マークダウン本文
- `status`: ステータス（draft/published/archived）

### メディア

`media`テーブルに保存されます：

- `id`: メディアID
- `content_id`: 紐付けられたコンテンツID
- `filename`: ファイル名
- `mime_type`: MIMEタイプ
- `data`: バイナリデータ（BLOB）
- `size`: ファイルサイズ

## API連携

md-editorは以下のeditor-home APIを使用します：

- `GET /api/contents`: コンテンツ一覧の取得
- `GET /api/markdown`: マークダウンページの取得
- `POST /api/markdown`: マークダウンページの作成
- `PUT /api/markdown`: マークダウンページの更新
- `GET /api/media`: メディアの取得
- `POST /api/media`: メディアのアップロード

## 技術スタック

- **Next.js 16**: Reactフレームワーク
- **Yoopta Editor**: リッチテキストエディタ
- **TypeScript**: 型安全性
- **Biome**: フォーマッター/リンター

## 開発

### フォーマット

```bash
pnpm format
```

### リント

```bash
pnpm lint
```

### 型チェック

```bash
pnpm type-check
```

## トラブルシューティング

### editor-homeに接続できない

1. editor-homeが起動しているか確認
2. `.env.local`の`NEXT_PUBLIC_EDITOR_HOME_URL`が正しいか確認
3. ブラウザのコンソールでエラーを確認

### メディアがアップロードできない

1. コンテンツが選択されているか確認
2. ファイルが画像または動画形式か確認
3. ファイルサイズが大きすぎないか確認

### 保存できない

1. コンテンツが選択されているか確認
2. スラッグが入力されているか確認
3. スラッグが既に使用されていないか確認
