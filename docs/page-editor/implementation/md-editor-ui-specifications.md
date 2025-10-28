# md-editor UI仕様書

## 概要

md-editorのUI実装を詳しく調査し、page-editorへの移植に必要な仕様をまとめます。

## UI構造

### 1. 全体レイアウト

#### 基本構造
```typescript
<div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#000", color: "#fff" }}>
  {/* サイドバー（320px固定幅） */}
  <aside style={{ width: "320px", borderRight: "1px solid #1f1f1f", padding: "24px" }}>
    {/* サイドバーコンテンツ */}
  </aside>
  
  {/* メインエディターエリア */}
  <main style={{ flex: 1, padding: "32px", minHeight: "100vh" }}>
    {/* エディターコンテンツ */}
  </main>
</div>
```

#### カラーテーマ
- **背景色**: `#000` (黒)
- **サイドバー背景**: `#050505` (濃いグレー)
- **ボーダー色**: `#1f1f1f` (グレー)
- **テキスト色**: `#fff` (白)
- **セカンダリテキスト**: `#94a3b8` (薄いグレー)

### 2. サイドバー構造

#### サイドバーの構成要素
1. **コンテンツ選択セクション**
2. **メッセージ表示エリア**
3. **保存ボタン**
4. **記事一覧セクション**
5. **メディア管理セクション**

#### コンテンツ選択
```typescript
<select
  value={selectedContentId}
  onChange={(e) => handleContentSelect(e.target.value)}
  style={{
    width: "100%",
    padding: "10px 24px 10px 10px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "#111",
    color: "#fff",
    appearance: "none",
    backgroundImage: 'url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23888888" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "10px",
  }}
>
  <option value="">-- コンテンツを選択してください --</option>
  {contents.map((content) => (
    <option key={content.id} value={content.id}>
      {content.title} ({content.id})
    </option>
  ))}
</select>
```

#### メッセージ表示
```typescript
{message && (
  <div
    style={{
      border: "1px solid",
      borderColor: message.type === "success" ? "#15803d" : "#dc2626",
      backgroundColor: message.type === "success" ? "#052e16" : "#2a0909",
      padding: "10px",
      borderRadius: "6px",
      fontSize: "13px",
    }}
  >
    {message.text}
  </div>
)}
```

#### 保存ボタン
```typescript
<button
  type="button"
  onClick={handleSave}
  disabled={saving || !currentPage || !hasChanges}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: saving || !currentPage || !hasChanges ? "#333" : "#2563eb",
    color: "#fff",
    cursor: saving || !currentPage || !hasChanges ? "not-allowed" : "pointer",
  }}
>
  {saving ? "保存中…" : "記事を保存"}
</button>
```

### 3. 記事一覧コンポーネント

#### ArticleList.tsx
```typescript
interface ArticleListProps {
  articles: MarkdownPage[];
  selectedArticleId?: string;
  isLoading?: boolean;
  onSelect: (page: MarkdownPage) => void;
  onEdit: (page: MarkdownPage) => void;
  onNew: () => void;
}
```

#### 記事一覧の表示
- **ヘッダー**: "記事一覧" + "新規作成"ボタン
- **スクロール可能**: 最大高さ320px
- **記事アイテム**: タイトル + スラッグ + "設定を編集"ボタン
- **選択状態**: 背景色で表示 (`#1f1f1f`)

#### 記事アイテムの構造
```typescript
<li
  style={{
    backgroundColor: isActive ? "#1f2937" : "transparent",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  }}
>
  <button onClick={() => onSelect(article)}>
    <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>
      {article.frontmatter.title || "（無題）"}
    </div>
    <div style={{ fontSize: "12px", color: "#bbbbbb" }}>
      {article.slug}
    </div>
  </button>
  
  <button onClick={() => onEdit(article)}>
    設定を編集
  </button>
</li>
```

### 4. メディア管理セクション

#### メディア表示
- **ヘッダー**: "メディア"
- **メディアアイテム**: ファイル名 + サイズ + 埋め込み/削除ボタン
- **アップロード**: ファイル選択によるアップロード

#### メディアアイテムの構造
```typescript
<li
  style={{
    border: "1px solid #1f1f1f",
    borderRadius: "6px",
    padding: "8px",
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
    <span>{media.filename}</span>
    <span style={{ color: "#999" }}>
      {(media.size / 1024).toFixed(1)} KB
    </span>
  </div>
  <div style={{ display: "flex", gap: "8px" }}>
    <button onClick={() => handleEmbedMedia(media)}>
      埋め込み
    </button>
    <button onClick={() => handleDeleteMedia(media)}>
      削除
    </button>
  </div>
</li>
```

### 5. メインエディターエリア

#### エディターの表示
```typescript
<main style={{ flex: 1, padding: "32px", minHeight: "100vh" }}>
  {currentPage ? (
    <>
      <div style={{ marginBottom: "16px", color: "#94a3b8" }}>
        編集中: {currentPage.frontmatter.title || "（無題）"} / {currentPage.slug}
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          minHeight: "600px",
          padding: "32px",
          backgroundColor: "transparent",
          borderRadius: "16px",
          color: "#fff",
        }}
      >
        {/* ブロックエディター */}
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          placeholder="ここに本文を入力するか、/ でコマンドメニューを開いてください…"
        />
      </div>
    </>
  ) : (
    <div style={{ border: "1px dashed #1f1f1f", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#94a3b8", maxWidth: "640px", margin: "0 auto" }}>
      {selectedContentId
        ? "記事を選択するか、新規作成してください。"
        : "コンテンツを選択すると記事を編集できます。"}
    </div>
  )}
</main>
```

### 6. モーダルダイアログ

#### 新規記事作成モーダル
```typescript
<Modal title="新規記事の作成" onClose={() => setIsCreateDialogOpen(false)}>
  <label className="modal-label">
    タイトル
    <input
      type="text"
      value={createTitle}
      onChange={(e) => setCreateTitle(e.target.value)}
      className="modal-input"
      placeholder="例: 新機能のお知らせ"
    />
  </label>
  <label className="modal-label">
    スラッグ
    <input
      type="text"
      value={createSlug}
      onChange={(e) => setCreateSlug(e.target.value)}
      className="modal-input"
      placeholder="例: product-update"
    />
  </label>
  <div className="modal-actions">
    <button onClick={() => setIsCreateDialogOpen(false)} className="modal-button ghost">
      キャンセル
    </button>
    <button onClick={handleCreateArticle} className="modal-button">
      作成
    </button>
  </div>
</Modal>
```

#### 記事編集モーダル
```typescript
<Modal title="記事を編集" onClose={() => setIsEditDialogOpen(false)}>
  <label className="modal-label">
    タイトル
    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="modal-input" />
  </label>
  <label className="modal-label">
    スラッグ
    <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="modal-input" />
  </label>
  <div className="modal-actions">
    <button onClick={() => handleDeleteArticle(editingPage)} className="modal-button danger">
      削除
    </button>
    <div style={{ flex: 1 }} />
    <button onClick={() => setIsEditDialogOpen(false)} className="modal-button ghost">
      キャンセル
    </button>
    <button onClick={handleEditMeta} className="modal-button">
      更新
    </button>
  </div>
</Modal>
```

#### モーダルのスタイル
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #050505;
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  margin-bottom: 12px;
  gap: 4px;
}

.modal-input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #111;
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.modal-button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.modal-button.ghost {
  background: #1f1f1f;
  color: #fff;
}

.modal-button.danger {
  background: #991b1b;
  color: #fff;
}

.modal-button:not(.ghost):not(.danger) {
  background: #2563eb;
  color: #fff;
}
```

## 操作性

### 1. 保存機能

#### 保存ボタンの状態管理
- **有効**: 記事が選択され、変更がある場合
- **無効**: 保存中、記事が選択されていない、変更がない場合
- **テキスト**: "保存中…" / "記事を保存"

#### 変更検知
```typescript
useEffect(() => {
  if (!currentPage) {
    setHasChanges(false);
    setOriginalContent("");
    return;
  }

  const currentMarkdown = getEditorContent();
  const hasChangesValue = currentMarkdown !== (originalContent || "");
  setHasChanges(hasChangesValue);
}, [currentPage, originalContent, getEditorContent]);
```

### 2. 記事管理

#### 記事の選択
- 記事一覧からクリックで選択
- 選択された記事は背景色で表示
- エディターに内容を読み込み

#### 記事の作成
- "新規作成"ボタンでモーダル表示
- タイトルとスラッグを入力
- 作成後、自動的にエディターにフォーカス

#### 記事の編集
- "設定を編集"ボタンでモーダル表示
- タイトルとスラッグを編集
- 削除ボタンで記事を削除

### 3. メディア管理

#### メディアの埋め込み
- "埋め込み"ボタンでエディターに挿入
- Markdown形式で挿入: `![filename](url)`

#### メディアの削除
- "削除"ボタンでメディアを削除
- エディター内の該当URLも自動削除

### 4. エディター操作

#### ブロックエディターの設定
- **ブロックタイプ**: SpacerBlock, ImageBlock, VideoBlock, AudioBlock, CustomBlock, MathBlock
- **Markdown標準**: 見出し、リスト、引用、テーブル、コードブロック等
- **スラッシュメニュー**: ブロック挿入メニュー

#### エディターの状態管理
- ブロック配列の管理
- Markdownとの相互変換
- 変更の検知と保存

## API連携

### 1. コンテンツ管理
- `fetchContentList()`: コンテンツ一覧取得
- `fetchContent(id)`: 特定コンテンツ取得

### 2. 記事管理
- `fetchMarkdownPages(contentId)`: 記事一覧取得
- `fetchMarkdownPage(id)`: 特定記事取得
- `createMarkdownPage(data)`: 記事作成
- `updateMarkdownPage(data)`: 記事更新
- `deleteMarkdownPage(id)`: 記事削除

### 3. メディア管理
- `fetchMediaList(contentId)`: メディア一覧取得
- `uploadMediaFile(contentId, file)`: メディアアップロード
- `deleteMedia(contentId, mediaId)`: メディア削除
- `getMediaUrl(contentId, mediaId)`: メディアURL取得

## データ変換

### 1. ブロック ↔ Markdown変換
- `convertBlocksToMarkdown()`: ブロック配列からMarkdownに変換
- `convertMarkdownToBlocks()`: Markdownからブロック配列に変換

### 2. 変換の特徴
- 空行の保持（SpacerBlock）
- 書式の保持（太字、斜体、コード等）
- 埋め込みコンテンツの保持（CustomBlock）
- メディアのAPI経由取得（ImageBlock, VideoBlock, AudioBlock）
- TeX数式の保持（MathBlock）

## page-editorへの移植方針

### 1. 移植する要素
- **サイドバー構造**: コンテンツ選択、記事一覧、メディア管理
- **モーダルダイアログ**: 記事作成・編集
- **メッセージ表示**: 成功・エラーメッセージ
- **保存機能**: 手動保存ボタン
- **カラーテーマ**: ダークテーマ

### 2. 変更する要素
- **エディター**: ブロックシステム（EditableText + ブロック）
- **データ変換**: ブロック ↔ Markdown
- **メディア表示**: API経由取得

### 3. 移植の優先順位
1. **サイドバー構造**: 基本的なレイアウト
2. **コンテンツ選択**: ドロップダウン選択
3. **記事一覧**: 記事の表示と選択
4. **メディア管理**: メディアの表示と操作
5. **モーダル**: 記事作成・編集ダイアログ
6. **保存機能**: 手動保存ボタン
7. **メッセージ表示**: フィードバック表示
