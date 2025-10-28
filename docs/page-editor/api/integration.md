# データ連携

## 概要

page-editorは、editor-homeとは独立したページ作成システムとして、独自のAPIエンドポイントを提供します。editor-homeのAPIを参考にしつつ、ブロックシステムに特化した機能を実装します。

## データフロー

```
page-editor (Frontend)
    ↓ HTTP API
page-editor (Backend)
    ↓ SQLite
Database (Storage)
```

## 独立システムとしての設計

### 1. データ構造の定義

#### ContentIndexItem
```typescript
interface ContentIndexItem {
  id: string;
  title: string;
  summary?: string;
  lang?: string;
  status?: string;
  visibility?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags?: string[];
}
```

#### MarkdownPage
```typescript
interface MarkdownPage {
  id: string;
  contentId?: string;
  slug: string;
  frontmatter: MarkdownFrontmatter;
  body: string;
  htmlCache?: string;
  path?: string;
  lang?: string;
  status?: "draft" | "published" | "archived";
  version?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

#### MediaItem
```typescript
interface MediaItem {
  id: string;
  contentId?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  data?: Buffer;
  base64?: string;
}
```

### 2. APIクライアントの移植

#### コンテンツ管理
```typescript
// lib/api/client.ts
export async function fetchContentList(): Promise<ContentIndexItem[]> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/contents`);
  if (!response.ok) {
    throw new Error("Failed to fetch content list");
  }
  return response.json();
}

export async function fetchContent(id: string): Promise<ContentIndexItem> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/contents?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch content");
  }
  return response.json();
}

export async function createContent(data: Partial<Content>): Promise<{ ok: boolean; id: string }> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/contents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create content");
  }
  return response.json();
}

export async function updateContent(data: Partial<Content>): Promise<{ ok: boolean }> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/contents`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update content");
  }
  return response.json();
}
```

#### マークダウンページ管理
```typescript
export async function fetchMarkdownPages(contentId?: string): Promise<MarkdownPage[]> {
  const url = new URL(`${EDITOR_HOME_URL}/api/markdown`);
  if (contentId) {
    url.searchParams.set("contentId", contentId);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch markdown pages");
  }
  return response.json();
}

export async function fetchMarkdownPage(idOrSlug: string): Promise<MarkdownPage> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/markdown?id=${idOrSlug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch markdown page");
  }
  return response.json();
}

export async function createMarkdownPage(data: Partial<MarkdownPage>): Promise<{
  ok: boolean;
  id: string;
  slug: string;
  page?: MarkdownPage | null;
}> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/markdown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to create markdown page");
  }
  return response.json();
}

export async function updateMarkdownPage(data: Partial<MarkdownPage>): Promise<{
  ok: boolean;
  id?: string;
  slug?: string;
  page?: MarkdownPage | null;
}> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/markdown`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to update markdown page");
  }
  return response.json();
}

export async function deleteMarkdownPage(idOrSlug: string): Promise<{ ok: boolean; id?: string }> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/markdown?id=${idOrSlug}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete markdown page");
  }
  return response.json();
}
```

#### メディア管理
```typescript
export async function fetchMediaList(contentId: string): Promise<MediaItem[]> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/media?contentId=${contentId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch media list");
  }
  return response.json();
}

export async function fetchMedia(contentId: string, mediaId: string): Promise<MediaItem> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/media?contentId=${contentId}&id=${mediaId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch media");
  }
  return response.json();
}

export async function uploadMedia(data: MediaUploadRequest): Promise<{ ok: boolean; id: string }> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to upload media");
  }
  return response.json();
}

export async function deleteMedia(contentId: string, mediaId: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${EDITOR_HOME_URL}/api/media?contentId=${contentId}&id=${mediaId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete media");
  }
  return response.json();
}

export async function uploadMediaFile(
  contentId: string,
  file: File,
  alt?: string,
  description?: string,
  tags?: string[],
): Promise<{ ok: boolean; id: string }> {
  // ファイルをBase64に変換
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${EDITOR_HOME_URL}/api/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentId,
      filename: file.name,
      mimeType: file.type,
      base64Data: base64,
      alt,
      description,
      tags,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to upload media");
  }
  return response.json();
}

export function getMediaUrl(contentId: string, mediaId: string): string {
  return `${EDITOR_HOME_URL}/api/media?contentId=${contentId}&id=${mediaId}`;
}
```

## サイドパネル統合

### 1. ContentSelector

#### コンテンツ選択パネル
```typescript
// components/panels/ContentSelector.tsx
import { useCallback, useEffect, useState } from "react";
import { fetchContentList } from "@/lib/api/client";
import type { ContentIndexItem } from "@/types/content";

interface ContentSelectorProps {
  selectedContentId?: string;
  onSelect: (contentId: string) => void;
}

export function ContentSelector({
  selectedContentId,
  onSelect,
}: ContentSelectorProps) {
  const [contents, setContents] = useState<ContentIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchContentList();
      setContents(data);
    } catch (err) {
      console.error("Failed to load contents:", err);
      setError(
        `コンテンツの読み込みに失敗しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="content-selector">
      <label htmlFor="content-select">コンテンツを選択</label>
      <select
        id="content-select"
        value={selectedContentId || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-- コンテンツを選択してください --</option>
        {contents.map((content) => (
          <option key={content.id} value={content.id}>
            {content.title} ({content.id})
          </option>
        ))}
      </select>
      {selectedContentId && (
        <p className="selected-info">
          選択中: {contents.find((c) => c.id === selectedContentId)?.title}
        </p>
      )}
    </div>
  );
}
```

### 2. ArticleList

#### 記事一覧パネル
```typescript
// components/panels/ArticleList.tsx
import { useCallback, useEffect, useState } from "react";
import { fetchMarkdownPages } from "@/lib/api/client";
import type { MarkdownPage } from "@/types/markdown";

interface ArticleListProps {
  contentId?: string;
  onSelect: (page: MarkdownPage) => void;
}

export function ArticleList({ contentId, onSelect }: ArticleListProps) {
  const [pages, setPages] = useState<MarkdownPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    if (!contentId) {
      setPages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMarkdownPages(contentId);
      setPages(data);
    } catch (err) {
      console.error("Failed to load pages:", err);
      setError(
        `ページの読み込みに失敗しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  if (!contentId) {
    return <div className="empty">コンテンツを選択してください</div>;
  }

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="article-list">
      <h3>記事一覧</h3>
      <div className="article-items">
        {pages.map((page) => (
          <div
            key={page.id}
            className="article-item"
            onClick={() => onSelect(page)}
          >
            <h4>{page.frontmatter.title || page.slug}</h4>
            <p>{page.frontmatter.description}</p>
            <span className="date">{page.updatedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. MediaManager

#### メディア管理パネル
```typescript
// components/panels/MediaManager.tsx
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { fetchMediaList, uploadMediaFile, deleteMedia } from "@/lib/api/client";
import type { MediaItem } from "@/types/media";

interface MediaManagerProps {
  contentId?: string;
  onSelect?: (media: MediaItem) => void;
}

export function MediaManager({ contentId, onSelect }: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadMedia = useCallback(async () => {
    if (!contentId) {
      setMediaItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMediaList(contentId);
      setMediaItems(data);
    } catch (err) {
      console.error("Failed to load media:", err);
      setError(
        `メディアの読み込みに失敗しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!contentId) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadMediaFile(contentId, file);
      }
      await loadMedia(); // 再読み込み
    } catch (err) {
      console.error("Failed to upload media:", err);
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }, [contentId, loadMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".ogg"],
      "audio/*": [".mp3", ".wav", ".ogg"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDelete = useCallback(async (mediaId: string) => {
    if (!contentId) return;

    try {
      await deleteMedia(contentId, mediaId);
      await loadMedia(); // 再読み込み
    } catch (err) {
      console.error("Failed to delete media:", err);
      setError("削除に失敗しました");
    }
  }, [contentId, loadMedia]);

  if (!contentId) {
    return <div className="empty">コンテンツを選択してください</div>;
  }

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="media-manager">
      <h3>メディア管理</h3>
      
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>ファイルをドロップしてください...</p>
        ) : (
          <p>ファイルをドラッグ&ドロップまたはクリックして選択</p>
        )}
      </div>

      {uploading && <div className="uploading">アップロード中...</div>}

      <div className="media-items">
        {mediaItems.map((media) => (
          <div key={media.id} className="media-item">
            <div className="media-preview">
              {media.mimeType.startsWith("image/") ? (
                <img
                  src={getMediaUrl(contentId, media.id)}
                  alt={media.alt}
                  className="preview-image"
                />
              ) : media.mimeType.startsWith("video/") ? (
                <video
                  src={getMediaUrl(contentId, media.id)}
                  className="preview-video"
                  controls
                />
              ) : (
                <div className="preview-file">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{media.filename}</span>
                </div>
              )}
            </div>
            <div className="media-info">
              <h4>{media.filename}</h4>
              <p>{media.description}</p>
              <div className="media-meta">
                <span>{media.mimeType}</span>
                <span>{Math.round(media.size / 1024)}KB</span>
                <span>{new Date(media.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="media-actions">
              <button onClick={() => onSelect?.(media)}>選択</button>
              <button onClick={() => handleDelete(media.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## データ変換

### 1. Yoopta → Markdown変換

#### 変換関数
```typescript
// lib/conversion/yoopta-to-markdown.ts
import type { YooptaContentValue } from "@yoopta/editor";

export function convertYooptaToMarkdownBlocks(
  yooptaData: YooptaContentValue
): string {
  const blocks: string[] = [];
  
  Object.values(yooptaData).forEach(block => {
    switch (block.type) {
      case 'Paragraph':
        blocks.push(convertParagraph(block));
        break;
      case 'HeadingOne':
        blocks.push(`# ${convertText(block)}`);
        break;
      case 'HeadingTwo':
        blocks.push(`## ${convertText(block)}`);
        break;
      case 'HeadingThree':
        blocks.push(`### ${convertText(block)}`);
        break;
      case 'BulletedList':
        blocks.push(convertBulletedList(block));
        break;
      case 'NumberedList':
        blocks.push(convertNumberedList(block));
        break;
      case 'TodoList':
        blocks.push(convertTodoList(block));
        break;
      case 'Blockquote':
        blocks.push(convertBlockquote(block));
        break;
      case 'Divider':
        blocks.push('---');
        break;
      case 'Callout':
        blocks.push(convertCallout(block));
        break;
      case 'Video':
        blocks.push(convertVideoBlock(block));
        break;
      case 'Image':
        blocks.push(convertImageBlock(block));
        break;
      case 'Code':
        blocks.push(convertCodeBlock(block));
        break;
      case 'Table':
        blocks.push(convertTableBlock(block));
        break;
      default:
        console.warn(`Unknown block type: ${block.type}`);
        break;
    }
  });
  
  return blocks.join('\n\n');
}

// 個別変換関数の実装
function convertParagraph(block: any): string {
  return convertText(block);
}

function convertBulletedList(block: any): string {
  return block.value.map((item: any) => `- ${convertText(item)}`).join('\n');
}

function convertNumberedList(block: any): string {
  return block.value.map((item: any, index: number) => `${index + 1}. ${convertText(item)}`).join('\n');
}

function convertTodoList(block: any): string {
  return block.value.map((item: any) => 
    `- [${item.checked ? 'x' : ' '}] ${convertText(item)}`
  ).join('\n');
}

function convertBlockquote(block: any): string {
  return `> ${convertText(block)}`;
}

function convertCallout(block: any): string {
  const icon = block.value.icon ? ` icon="${block.value.icon}"` : '';
  return `<Callout type="${block.value.type}"${icon}>\n${convertText(block)}\n</Callout>`;
}

function convertVideoBlock(block: any): string {
  const poster = block.value.poster ? ` poster="${block.value.poster}"` : '';
  const width = block.value.width ? ` width="${block.value.width}"` : '';
  const height = block.value.height ? ` height="${block.value.height}"` : '';
  const autoplay = block.value.autoplay ? ' autoplay={true}' : '';
  const controls = block.value.controls !== false ? ' controls={true}' : '';
  
  return `<Video src="${block.value.src}"${poster}${width}${height}${autoplay}${controls} />`;
}

function convertImageBlock(block: any): string {
  const alt = block.value.alt ? ` alt="${block.value.alt}"` : '';
  const width = block.value.width ? ` width="${block.value.width}"` : '';
  const height = block.value.height ? ` height="${block.value.height}"` : '';
  const caption = block.value.caption ? ` caption="${block.value.caption}"` : '';
  const lazy = block.value.lazy ? ' lazy={true}' : '';
  
  return `<Image src="${block.value.src}"${alt}${width}${height}${caption}${lazy} />`;
}

function convertCodeBlock(block: any): string {
  const language = block.value.language ? ` language="${block.value.language}"` : '';
  return `<Code${language}>\n${block.value.code}\n</Code>`;
}

function convertTableBlock(block: any): string {
  const headers = block.value.headers.join(' | ');
  const separator = block.value.headers.map(() => '---').join(' | ');
  const rows = block.value.rows.map((row: any) => 
    row.cells.map((cell: any) => cell.content).join(' | ')
  ).join('\n');
  
  return `<Table>\n| ${headers} |\n| ${separator} |\n${rows.split('\n').map(row => `| ${row} |`).join('\n')}\n</Table>`;
}

function convertText(block: any): string {
  if (typeof block.value === 'string') {
    return block.value;
  }
  
  if (Array.isArray(block.value)) {
    return block.value.map((item: any) => {
      if (typeof item === 'string') {
        return item;
      }
      if (item.text) {
        let text = item.text;
        if (item.bold) text = `**${text}**`;
        if (item.italic) text = `*${text}*`;
        if (item.underline) text = `<u>${text}</u>`;
        if (item.strikethrough) text = `~~${text}~~`;
        if (item.code) text = `\`${text}\``;
        return text;
      }
      return '';
    }).join('');
  }
  
  return '';
}
```

### 2. Markdown → ブロック変換

#### ブロック解析
```typescript
// lib/markdown/block-parser.ts
export interface ParsedBlock {
  type: 'markdown' | 'block';
  content: string;
  tag?: string;
  attributes?: Record<string, unknown>;
  children?: ParsedBlock[];
}

export function parseBlockTags(markdown: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // ブロックタグの検出
    const blockMatch = line.match(/^<(\w+)([^>]*?)(?:\/>|>.*?<\/\1>)$/);
    if (blockMatch) {
      const [, tagName, attributes] = blockMatch;
      const parsedAttributes = parseAttributes(attributes);
      
      // 自己完結タグの場合
      if (line.endsWith('/>')) {
        blocks.push({
          type: 'block',
          tag: tagName,
          attributes: parsedAttributes,
          content: ''
        });
      } else {
        // 開始・終了タグの場合
        const content = extractBlockContent(lines, i, tagName);
        blocks.push({
          type: 'block',
          tag: tagName,
          attributes: parsedAttributes,
          content: content
        });
        
        // 終了タグまでスキップ
        i = findClosingTag(lines, i, tagName);
      }
    } else {
      // 通常のMarkdown処理
      blocks.push({
        type: 'markdown',
        content: line
      });
    }
  }
  
  return blocks;
}

function parseAttributes(attributeString: string): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  
  // 属性の解析（簡易版）
  const attrRegex = /(\w+)(?:="([^"]*)"|={([^}]*)}|=\s*([^\s>]+))?/g;
  let match;
  
  while ((match = attrRegex.exec(attributeString)) !== null) {
    const [, name, quotedValue, jsValue, unquotedValue] = match;
    let value: unknown = true;
    
    if (quotedValue !== undefined) {
      value = quotedValue;
    } else if (jsValue !== undefined) {
      try {
        value = JSON.parse(jsValue);
      } catch {
        value = jsValue;
      }
    } else if (unquotedValue !== undefined) {
      value = unquotedValue;
    }
    
    attributes[name] = value;
  }
  
  return attributes;
}

function extractBlockContent(lines: string[], startIndex: number, tagName: string): string {
  const content: string[] = [];
  let depth = 1;
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    // 開始タグの検出
    const startTagMatch = line.match(new RegExp(`^<${tagName}([^>]*?)>`));
    if (startTagMatch) {
      depth++;
    }
    
    // 終了タグの検出
    const endTagMatch = line.match(new RegExp(`^</${tagName}>`));
    if (endTagMatch) {
      depth--;
      if (depth === 0) {
        break;
      }
    }
    
    content.push(line);
  }
  
  return content.join('\n');
}

function findClosingTag(lines: string[], startIndex: number, tagName: string): number {
  let depth = 1;
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    const startTagMatch = line.match(new RegExp(`^<${tagName}([^>]*?)>`));
    if (startTagMatch) {
      depth++;
    }
    
    const endTagMatch = line.match(new RegExp(`^</${tagName}>`));
    if (endTagMatch) {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  
  return lines.length - 1;
}
```

## エラーハンドリング

### 1. API エラーハンドリング

#### エラーハンドラー
```typescript
// lib/api/error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: unknown;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      errorDetails = errorData.details;
    } catch {
      // JSON解析に失敗した場合はテキストを取得
      try {
        errorMessage = await response.text();
      } catch {
        // テキスト取得にも失敗した場合はデフォルトメッセージを使用
      }
    }
    
    throw new APIError(errorMessage, response.status, errorDetails);
  }
  
  return response.json();
}
```

### 2. ネットワークエラーハンドリング

#### リトライ機能
```typescript
// lib/api/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // 指数バックオフ
      const delayMs = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError!;
}
```

## キャッシュ戦略

### 1. クライアントサイドキャッシュ

#### キャッシュマネージャー
```typescript
// lib/api/cache.ts
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();
```

### 2. React Query統合

#### クエリ設定
```typescript
// lib/api/react-query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useContentList() {
  return useQuery({
    queryKey: ['contents'],
    queryFn: fetchContentList,
    staleTime: 5 * 60 * 1000, // 5分
    cacheTime: 10 * 60 * 1000, // 10分
  });
}

export function useMarkdownPages(contentId?: string) {
  return useQuery({
    queryKey: ['markdown-pages', contentId],
    queryFn: () => fetchMarkdownPages(contentId),
    enabled: !!contentId,
    staleTime: 2 * 60 * 1000, // 2分
  });
}

export function useUpdateMarkdownPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateMarkdownPage,
    onSuccess: (data, variables) => {
      // キャッシュを無効化
      queryClient.invalidateQueries(['markdown-pages', variables.contentId]);
      queryClient.invalidateQueries(['markdown-page', variables.id]);
    },
  });
}
```
