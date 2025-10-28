# 詳細仕様

## 概要

page-editorの詳細仕様では、各コンポーネントの実装詳細、データ変換処理、エディタブルテキストブロック統合の具体的な仕様を定義します。

## アーキテクチャの詳細

### ディレクトリ構造
```
page-editor/
├── app/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── BlockEditor.tsx
│   │   │   ├── EditableText.tsx
│   │   │   ├── PreviewPane.tsx
│   │   │   ├── BlockToolbar.tsx
│   │   │   └── InlineToolbar.tsx
│   │   ├── blocks/
│   │   │   ├── basic/
│   │   │   │   ├── TextBlock.tsx
│   │   │   │   ├── HeadingBlock.tsx
│   │   │   │   ├── ListBlock.tsx
│   │   │   │   ├── QuoteBlock.tsx
│   │   │   │   └── CalloutBlock.tsx
│   │   │   ├── media/
│   │   │   │   ├── ImageBlock.tsx
│   │   │   │   ├── VideoBlock.tsx
│   │   │   │   ├── AudioBlock.tsx
│   │   │   │   ├── FileBlock.tsx
│   │   │   │   └── WebBookmarkBlock.tsx
│   │   │   ├── advanced/
│   │   │   │   ├── TableOfContentsBlock.tsx
│   │   │   │   ├── ToggleBlock.tsx
│   │   │   │   ├── MathBlock.tsx
│   │   │   │   └── CodeBlock.tsx
│   │   │   └── database/
│   │   │       ├── TableBlock.tsx
│   │   │       ├── BoardBlock.tsx
│   │   │       ├── CalendarBlock.tsx
│   │   │       └── GalleryBlock.tsx
│   │   ├── panels/
│   │   │   ├── ContentSelector.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   ├── MediaManager.tsx
│   │   │   └── BlockLibrary.tsx
│   │   └── layout/
│   │       ├── EditorLayout.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts          # md-editorから移植
│   │   │   ├── content.ts
│   │   │   ├── markdown.ts
│   │   │   └── media.ts
│   │   ├── markdown/
│   │   │   ├── parser.ts
│   │   │   ├── renderer.ts
│   │   │   ├── block-parser.ts
│   │   │   └── inline-parser.ts
│   │   ├── blocks/
│   │   │   ├── registry.ts
│   │   │   ├── resolver.ts
│   │   │   └── validator.ts
│   │   ├── editor/
│   │   │   ├── commands.ts
│   │   │   ├── shortcuts.ts
│   │   │   └── state.ts
│   │   ├── conversion/
│   │   │   ├── markdown-to-blocks.ts
│   │   │   └── blocks-to-markdown.ts
│   │   └── utils/
│   │       ├── file-upload.ts
│   │       ├── validation.ts
│   │       └── sanitize.ts
│   └── types/
│       ├── content.ts
│       ├── markdown.ts
│       ├── media.ts
│       ├── blocks.ts
│       ├── editor.ts
│       └── inline.ts
```

## データ変換の実装

### 1. ブロック ↔ Markdown変換

#### 変換関数の実装
```typescript
// lib/conversion/blocks-to-markdown.ts
export function convertBlocksToMarkdown(blocks: Block[]): string {
  const lines: string[] = [];
  
  blocks.forEach(block => {
    switch (block.type) {
      case 'spacer':
        lines.push(`<spacer height="${block.attributes.height}" />`);
        break;
      case 'image':
        const imageAlt = block.attributes.alt || '';
        const imageWidth = block.attributes.width ? ` width="${block.attributes.width}"` : '';
        const imageHeight = block.attributes.height ? ` height="${block.attributes.height}"` : '';
        lines.push(`<image src="${block.attributes.src}" alt="${imageAlt}"${imageWidth}${imageHeight} />`);
        break;
      case 'video':
        const videoPoster = block.attributes.poster ? ` poster="${block.attributes.poster}"` : '';
        const videoWidth = block.attributes.width ? ` width="${block.attributes.width}"` : '';
        const videoHeight = block.attributes.height ? ` height="${block.attributes.height}"` : '';
        const videoAutoplay = block.attributes.autoplay ? ' autoplay={true}' : '';
        const videoControls = block.attributes.controls !== false ? ' controls={true}' : '';
        lines.push(`<video src="${block.attributes.src}"${videoPoster}${videoWidth}${videoHeight}${videoAutoplay}${videoControls} />`);
        break;
      case 'audio':
        const audioControls = block.attributes.controls !== false ? ' controls={true}' : '';
        const audioAutoplay = block.attributes.autoplay ? ' autoplay={true}' : '';
        lines.push(`<audio src="${block.attributes.src}"${audioControls}${audioAutoplay} />`);
        break;
      case 'custom':
        lines.push(`<custom>\n${block.content}\n</custom>`);
        break;
      case 'math':
        lines.push(`<math>\n${block.content}\n</math>`);
        break;
      default:
        console.warn(`Unknown block type: ${block.type}`);
        break;
    }
  });
  
  return lines.join('\n\n');
}

// Markdownからブロックへの変換
export function convertMarkdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // 空行はスキップ
    if (line.trim() === '') {
      i++;
      continue;
    }
    
    // ブロックタグの解析
    if (line.startsWith('<spacer')) {
      const heightMatch = line.match(/height="(\d+)"/);
      if (heightMatch) {
        blocks.push({
          id: generateId(),
          type: 'spacer',
          content: '',
          attributes: { height: parseInt(heightMatch[1]) }
        });
      }
    } else if (line.startsWith('<image')) {
      const srcMatch = line.match(/src="([^"]+)"/);
      const altMatch = line.match(/alt="([^"]*)"/);
      const widthMatch = line.match(/width="(\d+)"/);
      const heightMatch = line.match(/height="(\d+)"/);
      
      if (srcMatch) {
        blocks.push({
          id: generateId(),
          type: 'image',
          content: '',
          attributes: {
            src: srcMatch[1],
            alt: altMatch ? altMatch[1] : '',
            width: widthMatch ? parseInt(widthMatch[1]) : undefined,
            height: heightMatch ? parseInt(heightMatch[1]) : undefined
          }
        });
      }
    } else if (line.startsWith('<video')) {
      const srcMatch = line.match(/src="([^"]+)"/);
      const posterMatch = line.match(/poster="([^"]+)"/);
      const widthMatch = line.match(/width="(\d+)"/);
      const heightMatch = line.match(/height="(\d+)"/);
      const autoplayMatch = line.match(/autoplay=\{true\}/);
      const controlsMatch = line.match(/controls=\{true\}/);
      
      if (srcMatch) {
        blocks.push({
          id: generateId(),
          type: 'video',
          content: '',
          attributes: {
            src: srcMatch[1],
            poster: posterMatch ? posterMatch[1] : undefined,
            width: widthMatch ? parseInt(widthMatch[1]) : undefined,
            height: heightMatch ? parseInt(heightMatch[1]) : undefined,
            autoplay: !!autoplayMatch,
            controls: controlsMatch !== null ? true : undefined
          }
        });
      }
    } else if (line.startsWith('<audio')) {
      const srcMatch = line.match(/src="([^"]+)"/);
      const controlsMatch = line.match(/controls=\{true\}/);
      const autoplayMatch = line.match(/autoplay=\{true\}/);
      
      if (srcMatch) {
        blocks.push({
          id: generateId(),
          type: 'audio',
          content: '',
          attributes: {
            src: srcMatch[1],
            controls: controlsMatch !== null ? true : undefined,
            autoplay: !!autoplayMatch
          }
        });
      }
    } else if (line.startsWith('<custom>')) {
      let content = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('</custom>')) {
        content += lines[i] + '\n';
        i++;
      }
      blocks.push({
        id: generateId(),
        type: 'custom',
        content: content.trim(),
        attributes: {}
      });
    } else if (line.startsWith('<math>')) {
      let content = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('</math>')) {
        content += lines[i] + '\n';
        i++;
      }
      blocks.push({
        id: generateId(),
        type: 'math',
        content: content.trim(),
        attributes: {}
      });
    }
    
    i++;
  }
  
  return blocks;
}

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### 2. Markdown標準記法の処理

#### ブロック解析の実装
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

## エディター統合の詳細

### 1. Notion風UI実装

#### スラッシュメニューの実装

#### SlashMenu.tsx
```typescript
import { useState, useEffect, useRef } from 'react';

interface SlashMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onSelect: (blockType: string) => void;
  onClose: () => void;
}

export function SlashMenu({ isVisible, position, onSelect, onClose }: SlashMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const blockTypes = [
    { type: 'text', label: 'テキスト', icon: '📝' },
    { type: 'heading', label: '見出し', icon: '📋' },
    { type: 'list', label: 'リスト', icon: '📝' },
    { type: 'quote', label: '引用', icon: '💬' },
    { type: 'image', label: '画像', icon: '🖼️' },
    { type: 'video', label: '動画', icon: '🎥' },
    { type: 'code', label: 'コード', icon: '💻' },
  ];
  
  const filteredBlocks = blockTypes.filter(block =>
    block.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredBlocks.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredBlocks.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredBlocks[selectedIndex]) {
            onSelect(filteredBlocks[selectedIndex].type);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, filteredBlocks, onSelect, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px]"
      style={{ left: position.x, top: position.y }}
    >
      {filteredBlocks.map((block, index) => (
        <div
          key={block.type}
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
            index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect(block.type)}
        >
          <span>{block.icon}</span>
          <span>{block.label}</span>
        </div>
      ))}
    </div>
  );
}
```

#### EditableTextでのスラッシュ検出
```typescript
const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
  const textContent = e.currentTarget.textContent || '';
  const lastChar = textContent.slice(-1);
  
  if (lastChar === '/') {
    // スラッシュメニューを表示
    const rect = e.currentTarget.getBoundingClientRect();
    setSlashMenuPosition({
      x: rect.left,
      y: rect.bottom
    });
    setShowSlashMenu(true);
  } else if (showSlashMenu && lastChar !== '/') {
    // スラッシュメニューを非表示
    setShowSlashMenu(false);
  }
  
  onChange(textContent);
};
```

### リアルタイムプレビューの実装

#### PreviewPane.tsx
```typescript
import { useMemo } from 'react';
import { BlockBase } from '@/types/blocks';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PreviewPaneProps {
  blocks: BlockBase[];
  className?: string;
}

export function PreviewPane({ blocks, className }: PreviewPaneProps) {
  const markdownContent = useMemo(() => {
    return blocks.map(block => {
      switch (block.type) {
        case 'text':
          return block.content;
        case 'heading':
          const level = block.attributes?.level || 1;
          return `${'#'.repeat(level)} ${block.content}`;
        case 'list':
          return block.content.split('\n').map(line => `- ${line}`).join('\n');
        case 'quote':
          return `> ${block.content}`;
        case 'code':
          return `\`\`\`${block.attributes?.language || ''}\n${block.content}\n\`\`\``;
        case 'image':
          return `![${block.attributes?.alt || ''}](${block.attributes?.src || ''})`;
        case 'video':
          return `<video src="${block.attributes?.src || ''}" controls></video>`;
        default:
          return block.content;
      }
    }).join('\n\n');
  }, [blocks]);

  return (
    <div className={`preview-pane ${className || ''}`}>
      <div className="preview-header">
        <h3>プレビュー</h3>
      </div>
      <div className="preview-content">
        <MarkdownRenderer content={markdownContent} />
      </div>
    </div>
  );
}
```

#### MarkdownRenderer.tsx
```typescript
import { useMemo } from 'react';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => {
    const processor = remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false });
    
    const result = processor.processSync(content);
    return result.toString();
  }, [content]);

  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
```

### ブロック左の+ボタンとドラッグハンドル
```typescript
// components/editor/BlockControls.tsx
import { useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';

interface BlockControlsProps {
  blockId: string;
  onInsertBlock: (type: string, position: 'before' | 'after') => void;
  onMoveBlock: (direction: 'up' | 'down') => void;
  onDeleteBlock: () => void;
}

export function BlockControls({ 
  blockId, 
  onInsertBlock, 
  onMoveBlock, 
  onDeleteBlock 
}: BlockControlsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const blockTypes = [
    { type: 'text', label: 'テキスト', icon: '📝' },
    { type: 'heading', label: '見出し', icon: '📋' },
    { type: 'image', label: '画像', icon: '🖼️' },
    { type: 'video', label: '動画', icon: '🎥' },
    { type: 'code', label: 'コード', icon: '💻' },
    { type: 'list', label: 'リスト', icon: '📝' },
    { type: 'quote', label: '引用', icon: '💬' },
    { type: 'callout', label: 'コールアウト', icon: '💡' },
  ];

  return (
    <div className="block-controls">
      {/* ドラッグハンドル */}
      <div 
        className="drag-handle"
        draggable
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        <GripVertical size={16} />
      </div>

      {/* +ボタン */}
      <div className="add-button-container">
        <button 
          className="add-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Plus size={16} />
        </button>

        {/* ブロック挿入メニュー */}
        {showMenu && (
          <div className="block-menu">
            <div className="menu-header">
              <span>ブロックを挿入</span>
            </div>
            <div className="menu-items">
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.type}
                  className="menu-item"
                  onClick={() => {
                    onInsertBlock(blockType.type, 'after');
                    setShowMenu(false);
                  }}
                >
                  <span className="menu-icon">{blockType.icon}</span>
                  <span className="menu-label">{blockType.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### スラッシュメニュー実装
```typescript
// components/editor/SlashMenu.tsx
import { useState, useEffect, useRef } from 'react';

interface SlashMenuProps {
  position: { x: number; y: number };
  onSelect: (blockType: string) => void;
  onClose: () => void;
}

export function SlashMenu({ position, onSelect, onClose }: SlashMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const blockTypes = [
    { type: 'text', label: 'テキスト', icon: '📝', keywords: ['text', 'テキスト', '文章'] },
    { type: 'heading', label: '見出し', icon: '📋', keywords: ['heading', '見出し', 'h1', 'h2', 'h3'] },
    { type: 'image', label: '画像', icon: '🖼️', keywords: ['image', '画像', 'img', 'picture'] },
    { type: 'video', label: '動画', icon: '🎥', keywords: ['video', '動画', 'movie'] },
    { type: 'audio', label: '音声', icon: '🎵', keywords: ['audio', '音声', 'sound'] },
    { type: 'file', label: 'ファイル', icon: '📎', keywords: ['file', 'ファイル', 'attachment'] },
    { type: 'code', label: 'コード', icon: '💻', keywords: ['code', 'コード', 'programming'] },
    { type: 'list', label: 'リスト', icon: '📝', keywords: ['list', 'リスト', 'bullet', 'ordered'] },
    { type: 'quote', label: '引用', icon: '💬', keywords: ['quote', '引用', 'blockquote'] },
    { type: 'callout', label: 'コールアウト', icon: '💡', keywords: ['callout', 'コールアウト', 'info', 'warning'] },
    { type: 'toggle', label: 'トグル', icon: '🔽', keywords: ['toggle', 'トグル', '折りたたみ'] },
    { type: 'table', label: 'テーブル', icon: '📊', keywords: ['table', 'テーブル', '表'] },
    { type: 'math', label: '数式', icon: '🧮', keywords: ['math', '数式', 'formula', 'latex'] },
    { type: 'divider', label: '区切り線', icon: '➖', keywords: ['divider', '区切り線', 'hr', 'separator'] },
  ];

  const filteredBlocks = blockTypes.filter(block =>
    block.keywords.some(keyword =>
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredBlocks.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredBlocks.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredBlocks[selectedIndex]) {
          onSelect(filteredBlocks[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredBlocks, onSelect, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  return (
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
    >
      <div className="menu-search">
        <input
          type="text"
          placeholder="ブロックを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>
      <div className="menu-items">
        {filteredBlocks.map((block, index) => (
          <button
            key={block.type}
            className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(block.type)}
          >
            <span className="menu-icon">{block.icon}</span>
            <span className="menu-label">{block.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. Markdown記法保持表示

#### Markdown記法を保持したレンダリング
```typescript
// components/editor/MarkdownRenderer.tsx
import { useMemo } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  preserveMarkdown?: boolean;
}

export function MarkdownRenderer({ content, preserveMarkdown = true }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    if (!preserveMarkdown) {
      // 通常のMarkdownレンダリング
      const processor = remark().use(remarkGfm);
      return processor.processSync(content).toString();
    }

    // Markdown記法を保持したレンダリング
    return renderWithPreservedMarkdown(content);
  }, [content, preserveMarkdown]);

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

function renderWithPreservedMarkdown(content: string): string {
  const lines = content.split('\n');
  const renderedLines: string[] = [];

  for (const line of lines) {
    if (line.match(/^#{1,6}\s+/)) {
      // 見出し: # タイトル → <h1># タイトル</h1>
      const level = line.match(/^(#{1,6})/)?.[1].length || 1;
      const text = line.replace(/^#{1,6}\s+/, '');
      renderedLines.push(`<h${level} class="preserved-markdown">${line}</h${level}>`);
    } else if (line.match(/^[-*+]\s+/)) {
      // リスト: - 項目 → <li>- 項目</li>
      renderedLines.push(`<li class="preserved-markdown">${line}</li>`);
    } else if (line.match(/^\d+\.\s+/)) {
      // 番号付きリスト: 1. 項目 → <li>1. 項目</li>
      renderedLines.push(`<li class="preserved-markdown ordered">${line}</li>`);
    } else if (line.match(/^>\s+/)) {
      // 引用: > テキスト → <blockquote>> テキスト</blockquote>
      renderedLines.push(`<blockquote class="preserved-markdown">${line}</blockquote>`);
    } else if (line.match(/^```/)) {
      // コードブロック
      renderedLines.push(`<pre class="preserved-markdown"><code>${line}</code></pre>`);
    } else if (line.match(/^---$/)) {
      // 区切り線
      renderedLines.push(`<hr class="preserved-markdown" />`);
    } else if (line.trim() === '') {
      // 空行
      renderedLines.push('<br />');
    } else {
      // 通常のテキスト
      renderedLines.push(`<p class="preserved-markdown">${line}</p>`);
    }
  }

  return renderedLines.join('\n');
}
```

### 3. エディタブルテキスト実装

#### インライン編集可能なテキスト要素
```typescript
// components/editor/EditableText.tsx
import { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export function EditableText({ 
  value, 
  onChange, 
  placeholder = 'テキストを入力...',
  className = '',
  multiline = false
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`editable-input ${className}`}
        {...(multiline && { rows: 3 })}
      />
    );
  }

  return (
    <div
      className={`editable-text ${className} ${!value ? 'empty' : ''}`}
      onClick={handleClick}
    >
      {value || placeholder}
    </div>
  );
}
```

### 4. メディアバイナリ埋め込み機能

#### 画像・動画の直接埋め込みと再生
```typescript
// components/media/MediaEmbedder.tsx
import { useState, useRef, useEffect } from 'react';

interface MediaEmbedderProps {
  mediaId: string;
  mediaType: 'image' | 'video' | 'audio';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  controls?: boolean;
  autoplay?: boolean;
}

export function MediaEmbedder({
  mediaId,
  mediaType,
  src,
  alt,
  width,
  height,
  controls = true,
  autoplay = false
}: MediaEmbedderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<string | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>(null);

  useEffect(() => {
    loadMediaData();
  }, [src]);

  const loadMediaData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Base64データまたはBlob URLを取得
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to load media: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setMediaData(blobUrl);
    } catch (err) {
      console.error('Failed to load media:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
  };

  const handleMediaError = () => {
    setError('メディアの読み込みに失敗しました');
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="media-embedder loading">
        <div className="loading-spinner">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="media-embedder error">
        <div className="error-message">{error}</div>
        <button onClick={loadMediaData} className="retry-button">
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="media-embedder">
      {mediaType === 'image' && (
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          src={mediaData || src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleMediaLoad}
          onError={handleMediaError}
          className="embedded-image"
          loading="lazy"
        />
      )}
      
      {mediaType === 'video' && (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={mediaData || src}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoplay}
          onLoadedData={handleMediaLoad}
          onError={handleMediaError}
          className="embedded-video"
        />
      )}
      
      {mediaType === 'audio' && (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={mediaData || src}
          controls={controls}
          autoPlay={autoplay}
          onLoadedData={handleMediaLoad}
          onError={handleMediaError}
          className="embedded-audio"
        />
      )}
    </div>
  );
}
```

#### メディアブロックでのバイナリ埋め込み
```typescript
// components/blocks/media/ImageBlock.tsx
import { MediaEmbedder } from '@/components/media/MediaEmbedder';

interface ImageBlockProps {
  block: ImageBlock;
  onUpdate: (block: ImageBlock) => void;
}

export function ImageBlock({ block, onUpdate }: ImageBlockProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      // ファイルをBase64に変換
      const base64 = await fileToBase64(file);
      
      // ブロックを更新
      const updatedBlock: ImageBlock = {
        ...block,
        src: base64,
        alt: file.name,
        width: block.width || 600,
        height: block.height || 400,
      };
      
      onUpdate(updatedBlock);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <div className="image-block">
      <div className="block-controls">
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '完了' : '編集'}
        </button>
      </div>
      
      {isEditing ? (
        <div className="image-editor">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
          <input
            type="text"
            placeholder="代替テキスト"
            value={block.alt || ''}
            onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
          />
        </div>
      ) : (
        <MediaEmbedder
          mediaId={block.id}
          mediaType="image"
          src={block.src}
          alt={block.alt}
          width={block.width}
          height={block.height}
        />
      )}
      
      {block.caption && (
        <div className="image-caption">
          <EditableText
            value={block.caption}
            onChange={(caption) => onUpdate({ ...block, caption })}
            placeholder="キャプションを入力..."
          />
        </div>
      )}
    </div>
  );
}

// ユーティリティ関数
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

#### 動画ブロックでのバイナリ埋め込み
```typescript
// components/blocks/media/VideoBlock.tsx
import { MediaEmbedder } from '@/components/media/MediaEmbedder';

interface VideoBlockProps {
  block: VideoBlock;
  onUpdate: (block: VideoBlock) => void;
}

export function VideoBlock({ block, onUpdate }: VideoBlockProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleVideoUpload = async (file: File) => {
    try {
      // ファイルをBase64に変換
      const base64 = await fileToBase64(file);
      
      // ブロックを更新
      const updatedBlock: VideoBlock = {
        ...block,
        src: base64,
        width: block.width || 800,
        height: block.height || 450,
      };
      
      onUpdate(updatedBlock);
    } catch (error) {
      console.error('Failed to upload video:', error);
    }
  };

  return (
    <div className="video-block">
      <div className="block-controls">
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '完了' : '編集'}
        </button>
      </div>
      
      {isEditing ? (
        <div className="video-editor">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoUpload(file);
            }}
          />
          <div className="video-settings">
            <label>
              <input
                type="checkbox"
                checked={block.autoplay || false}
                onChange={(e) => onUpdate({ ...block, autoplay: e.target.checked })}
              />
              自動再生
            </label>
            <label>
              <input
                type="checkbox"
                checked={block.controls !== false}
                onChange={(e) => onUpdate({ ...block, controls: e.target.checked })}
              />
              コントロール表示
            </label>
            <label>
              <input
                type="checkbox"
                checked={block.loop || false}
                onChange={(e) => onUpdate({ ...block, loop: e.target.checked })}
              />
              ループ再生
            </label>
          </div>
        </div>
      ) : (
        <MediaEmbedder
          mediaId={block.id}
          mediaType="video"
          src={block.src}
          width={block.width}
          height={block.height}
          controls={block.controls}
          autoplay={block.autoplay}
        />
      )}
    </div>
  );
}
```

### 5. Monaco Editor設定

#### エディターコンポーネント
```typescript
// components/editor/MarkdownEditor.tsx
import { Editor } from '@monaco-editor/react';
import { useCallback, useEffect, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  onSelectionChange?: (selection: any) => void;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  onCursorChange, 
  onSelectionChange 
}: MarkdownEditorProps) {
  const editorRef = useRef<any>(null);
  
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // カスタム補完の設定
    setupCustomCompletion(monaco);
    
    // ブロックタグのシンタックスハイライト
    setupBlockSyntaxHighlighting(monaco);
    
    // スラッシュメニューの設定
    setupSlashMenu(editor, monaco);
    
    // ショートカットキーの設定
    setupShortcuts(editor, monaco);
    
    // イベントリスナーの設定
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange?.(e.position);
    });
    
    editor.onDidChangeCursorSelection((e: any) => {
      onSelectionChange?.(e.selection);
    });
  }, [onCursorChange, onSelectionChange]);
  
  return (
    <Editor
      height="100vh"
      defaultLanguage="markdown"
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        automaticLayout: true,
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showKeywords: true,
          showWords: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          showIssues: true,
          showUsers: true,
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true,
        },
        parameterHints: {
          enabled: true,
        },
        hover: {
          enabled: true,
        },
        contextmenu: true,
        mouseWheelZoom: true,
        multiCursorModifier: 'ctrlCmd',
        accessibilitySupport: 'auto',
        bracketPairColorization: {
          enabled: true,
        },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        renderWhitespace: 'selection',
        renderControlCharacters: true,
        fontLigatures: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
        lineHeight: 1.5,
        letterSpacing: 0.5,
        cursorBlinking: 'blink',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
        mouseWheelScrollSensitivity: 1,
        fastScrollSensitivity: 5,
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: 5,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          verticalScrollbarSize: 14,
          horizontalScrollbarSize: 14,
          verticalSliderSize: 14,
          horizontalSliderSize: 14,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          verticalArrowSize: 14,
          horizontalArrowSize: 14,
          verticalScrollbarHasSlider: true,
          horizontalScrollbarHasSlider: true,
          handleMouseWheel: true,
          alwaysConsumeMouseWheel: false,
        },
        overviewRulerLanes: 3,
        overviewRulerBorder: true,
        cursorWidth: 0,
        cursorStyle: 'line',
        hideCursorInOverviewRuler: false,
        renderLineHighlight: 'line',
        renderLineHighlightOnlyWhenFocus: false,
        links: true,
        detectIndentation: true,
        insertSpaces: true,
        tabSize: 2,
        trimAutoWhitespace: true,
        largeFileOptimizations: true,
        wordBasedSuggestions: 'matchingDocuments',
        wordBasedSuggestionsMode: 'matchingDocuments',
        stablePeek: false,
        maxTokenizationLineLength: 20000,
        maxComputationTime: 5000,
        stopRenderingLineAfter: 10000,
        renderValidationDecorations: 'on',
        renderIndentGuides: true,
        highlightActiveIndentGuide: true,
        indentSize: 2,
        insertFinalNewline: true,
        trimFinalNewlines: true,
        bracketPairColorization: {
          enabled: true,
        },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
      }}
    />
  );
}

// カスタム補完の設定
function setupCustomCompletion(monaco: any) {
  monaco.languages.registerCompletionItemProvider('markdown', {
    provideCompletionItems: (model: any, position: any) => {
      const suggestions = [
        // ブロックタグの補完
        {
          label: 'Image',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<Image src="${1:url}" alt="${2:alt}" width="${3:600}" height="${4:400}" />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '画像ブロックを挿入します',
        },
        {
          label: 'Video',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<Video src="${1:url}" poster="${2:poster}" width="${3:800}" height="${4:450}" />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '動画ブロックを挿入します',
        },
        {
          label: 'Callout',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<Callout type="${1:info}" icon="${2:💡}">\n${3:内容}\n</Callout>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'コールアウトブロックを挿入します',
        },
        {
          label: 'Code',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<Code language="${1:javascript}">\n${2:コード}\n</Code>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'コードブロックを挿入します',
        },
        {
          label: 'Math',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<Math>\n${1:数式}\n</Math>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '数式ブロックを挿入します',
        },
        {
          label: 'Toggle',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<Toggle title="${1:タイトル}">\n${2:内容}\n</Toggle>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'トグルブロックを挿入します',
        },
        {
          label: 'TableOfContents',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<TableOfContents />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '目次を自動生成します',
        },
      ];
      
      return { suggestions };
    },
  });
}

// ブロックタグのシンタックスハイライト
function setupBlockSyntaxHighlighting(monaco: any) {
  monaco.languages.setMonarchTokensProvider('markdown', {
    tokenizer: {
      root: [
        // ブロックタグの検出
        [/<(\w+)([^>]*?)(?:\/>|>.*?<\/\1>)/, 'block-tag'],
        // インライン記法
        [/@\w+/, 'mention'],
        [/\[\[.*?\]\]/, 'page-link'],
        [/@\d{4}-\d{2}-\d{2}/, 'date'],
        [/:\w+:/, 'emoji'],
        // Markdown記法
        [/#{1,6}\s+.*/, 'heading'],
        [/\*\*.*?\*\*/, 'bold'],
        [/\*.*?\*/, 'italic'],
        [/`.*?`/, 'code'],
        [/\[.*?\]\(.*?\)/, 'link'],
        [/!\[.*?\]\(.*?\)/, 'image'],
        [/^\s*[-*+]\s+/, 'list-item'],
        [/^\s*\d+\.\s+/, 'list-item'],
        [/^\s*>\s+/, 'quote'],
        [/^---+$/, 'divider'],
      ],
    },
  });
  
  monaco.editor.defineTheme('markdown-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'block-tag', foreground: '569cd6' },
      { token: 'mention', foreground: '4ec9b0' },
      { token: 'page-link', foreground: '4ec9b0' },
      { token: 'date', foreground: 'ce9178' },
      { token: 'emoji', foreground: 'dcdcaa' },
      { token: 'heading', foreground: 'd4d4d4', fontStyle: 'bold' },
      { token: 'bold', foreground: 'd4d4d4', fontStyle: 'bold' },
      { token: 'italic', foreground: 'd4d4d4', fontStyle: 'italic' },
      { token: 'code', foreground: 'ce9178' },
      { token: 'link', foreground: '4ec9b0' },
      { token: 'image', foreground: '4ec9b0' },
      { token: 'list-item', foreground: 'd4d4d4' },
      { token: 'quote', foreground: '6a9955' },
      { token: 'divider', foreground: '808080' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editor.selectionBackground': '#264f78',
      'editor.selectionHighlightBackground': '#add6ff26',
      'editorCursor.foreground': '#aeafad',
      'editorWhitespace.foreground': '#3e4042',
    },
  });
}

// スラッシュメニューの統合
function setupSlashMenu(editor: any, monaco: any) {
  let slashMenu: any = null;
  
  // スラッシュ文字の検出
  editor.onDidChangeModelContent((e: any) => {
    const model = editor.getModel();
    const position = editor.getPosition();
    const line = model.getLineContent(position.lineNumber);
    const textBeforeCursor = line.substring(0, position.column - 1);
    
    // スラッシュ文字の検出
    const slashMatch = textBeforeCursor.match(/\/([^\/\s]*)$/);
    if (slashMatch) {
      const query = slashMatch[1];
      showSlashMenu(editor, position, query);
    } else if (slashMenu) {
      hideSlashMenu();
    }
  });
  
  function showSlashMenu(editor: any, position: any, query: string) {
    const coords = editor.getScrolledVisiblePosition(position);
    const domNode = editor.getDomNode();
    const rect = domNode.getBoundingClientRect();
    
    slashMenu = {
      position: {
        x: rect.left + coords.left,
        y: rect.top + coords.top + 20
      },
      query,
      editor,
      position
    };
    
    // スラッシュメニューコンポーネントを表示
    // 実際の実装では、Reactコンポーネントをレンダリング
    console.log('Show slash menu:', slashMenu);
  }
  
  function hideSlashMenu() {
    slashMenu = null;
    // スラッシュメニューコンポーネントを非表示
    console.log('Hide slash menu');
  }
  
  // スラッシュメニューでの選択処理
  window.addEventListener('slash-menu-select', (e: any) => {
    if (slashMenu) {
      const { blockType } = e.detail;
      insertBlock(blockType);
      hideSlashMenu();
    }
  });
  
  function insertBlock(blockType: string) {
    const { editor, position } = slashMenu;
    const model = editor.getModel();
    const line = model.getLineContent(position.lineNumber);
    const textBeforeCursor = line.substring(0, position.column - 1);
    
    // スラッシュ部分を削除
    const slashIndex = textBeforeCursor.lastIndexOf('/');
    const beforeSlash = line.substring(0, slashIndex);
    
    // ブロックタグを挿入
    let blockTag = '';
    switch (blockType) {
      case 'text':
        blockTag = 'テキスト';
        break;
      case 'heading':
        blockTag = '# 見出し';
        break;
      case 'image':
        blockTag = '<Image src="url" alt="alt" width="600" height="400" />';
        break;
      case 'video':
        blockTag = '<Video src="url" poster="poster" width="800" height="450" />';
        break;
      case 'code':
        blockTag = '<Code language="javascript">\nコード\n</Code>';
        break;
      case 'list':
        blockTag = '- リスト項目';
        break;
      case 'quote':
        blockTag = '> 引用文';
        break;
      case 'callout':
        blockTag = '<Callout type="info" icon="💡">\nコールアウト\n</Callout>';
        break;
      default:
        blockTag = 'ブロック';
    }
    
    // テキストを置換
    const newLine = beforeSlash + blockTag + line.substring(position.column - 1);
    editor.executeEdits('slash-menu', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: line.length + 1
      },
      text: newLine
    }]);
  }
}

// ショートカットキーの設定
function setupShortcuts(editor: any, monaco: any) {
  // Ctrl/Cmd + B: 太字
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
    const selection = editor.getSelection();
    const text = editor.getModel()?.getValueInRange(selection);
    if (text) {
      editor.executeEdits('bold', [{
        range: selection,
        text: `**${text}**`,
      }]);
    }
  });
  
  // Ctrl/Cmd + I: 斜体
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
    const selection = editor.getSelection();
    const text = editor.getModel()?.getValueInRange(selection);
    if (text) {
      editor.executeEdits('italic', [{
        range: selection,
        text: `*${text}*`,
      }]);
    }
  });
  
  // Ctrl/Cmd + K: リンク
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    const selection = editor.getSelection();
    const text = editor.getModel()?.getValueInRange(selection);
    if (text) {
      editor.executeEdits('link', [{
        range: selection,
        text: `[${text}](url)`,
      }]);
    }
  });
  
  // Ctrl/Cmd + Shift + I: 画像挿入
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI, () => {
    const selection = editor.getSelection();
    editor.executeEdits('image', [{
      range: selection,
      text: '<Image src="url" alt="alt" width="600" height="400" />',
    }]);
  });
  
  // Ctrl/Cmd + Shift + V: 動画挿入
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV, () => {
    const selection = editor.getSelection();
    editor.executeEdits('video', [{
      range: selection,
      text: '<Video src="url" poster="poster" width="800" height="450" />',
    }]);
  });
}
```

### 2. リアルタイムプレビュー

#### プレビューパネル
```typescript
// components/editor/PreviewPane.tsx
import { useEffect, useState, ReactNode } from 'react';
import { parseBlockTags } from '@/lib/markdown/block-parser';
import { renderBlocks } from '@/lib/markdown/renderer';

interface PreviewPaneProps {
  markdown: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export function PreviewPane({ 
  markdown, 
  theme = 'light', 
  className = '' 
}: PreviewPaneProps) {
  const [renderedContent, setRenderedContent] = useState<ReactNode>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const updatePreview = async () => {
      setIsLoading(true);
      
      try {
        // ブロックタグの解析
        const blocks = parseBlockTags(markdown);
        
        // ブロックのレンダリング
        const rendered = await renderBlocks(blocks);
        
        setRenderedContent(rendered);
      } catch (error) {
        console.error('Preview rendering error:', error);
        setRenderedContent(<div className="error">プレビューのレンダリングに失敗しました</div>);
      } finally {
        setIsLoading(false);
      }
    };
    
    // デバウンス処理
    const timeoutId = setTimeout(updatePreview, 300);
    
    return () => clearTimeout(timeoutId);
  }, [markdown]);
  
  return (
    <div className={`preview-pane ${theme} ${className}`}>
      <div className="preview-header">
        <h3>プレビュー</h3>
        {isLoading && <div className="loading">読み込み中...</div>}
      </div>
      <div className="preview-content">
        {renderedContent}
      </div>
    </div>
  );
}
```

## サイドパネルの実装

### 1. ContentSelector

#### コンテンツ選択パネル
```typescript
// components/panels/ContentSelector.tsx
import { useCallback, useEffect, useState } from 'react';
import { fetchContentList } from '@/lib/api/client';
import type { ContentIndexItem } from '@/types/content';

interface ContentSelectorProps {
  selectedContentId?: string;
  onSelect: (contentId: string) => void;
  className?: string;
}

export function ContentSelector({ 
  selectedContentId, 
  onSelect, 
  className = '' 
}: ContentSelectorProps) {
  const [contents, setContents] = useState<ContentIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchContentList();
      setContents(data);
    } catch (err) {
      console.error('Failed to load contents:', err);
      setError(
        `コンテンツの読み込みに失敗しました: ${
          err instanceof Error ? err.message : '不明なエラー'
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadContents();
  }, [loadContents]);
  
  const handleSelect = useCallback((contentId: string) => {
    onSelect(contentId);
  }, [onSelect]);
  
  if (loading) {
    return (
      <div className={`content-selector loading ${className}`}>
        <div className="loading-spinner">読み込み中...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`content-selector error ${className}`}>
        <div className="error-message">{error}</div>
        <button onClick={loadContents} className="retry-button">
          再試行
        </button>
      </div>
    );
  }
  
  return (
    <div className={`content-selector ${className}`}>
      <label htmlFor="content-select" className="label">
        コンテンツを選択
      </label>
      <select
        id="content-select"
        value={selectedContentId || ''}
        onChange={(e) => handleSelect(e.target.value)}
        className="select"
      >
        <option value="">-- コンテンツを選択してください --</option>
        {contents.map((content) => (
          <option key={content.id} value={content.id}>
            {content.title} ({content.id})
          </option>
        ))}
      </select>
      {selectedContentId && (
        <div className="selected-info">
          <p className="selected-title">
            選択中: {contents.find((c) => c.id === selectedContentId)?.title}
          </p>
          <p className="selected-summary">
            {contents.find((c) => c.id === selectedContentId)?.summary}
          </p>
        </div>
      )}
    </div>
  );
}
```

### 2. ArticleList

#### 記事一覧パネル
```typescript
// components/panels/ArticleList.tsx
import { useCallback, useEffect, useState } from 'react';
import { fetchMarkdownPages } from '@/lib/api/client';
import type { MarkdownPage } from '@/types/markdown';

interface ArticleListProps {
  contentId?: string;
  onSelect: (page: MarkdownPage) => void;
  className?: string;
}

export function ArticleList({ 
  contentId, 
  onSelect, 
  className = '' 
}: ArticleListProps) {
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
      console.error('Failed to load pages:', err);
      setError(
        `ページの読み込みに失敗しました: ${
          err instanceof Error ? err.message : '不明なエラー'
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [contentId]);
  
  useEffect(() => {
    loadPages();
  }, [loadPages]);
  
  const handlePageSelect = useCallback((page: MarkdownPage) => {
    onSelect(page);
  }, [onSelect]);
  
  if (!contentId) {
    return (
      <div className={`article-list empty ${className}`}>
        <p className="empty-message">コンテンツを選択してください</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className={`article-list loading ${className}`}>
        <div className="loading-spinner">読み込み中...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`article-list error ${className}`}>
        <div className="error-message">{error}</div>
        <button onClick={loadPages} className="retry-button">
          再試行
        </button>
      </div>
    );
  }
  
  return (
    <div className={`article-list ${className}`}>
      <div className="article-header">
        <h3 className="title">記事一覧</h3>
        <div className="count">{pages.length}件</div>
      </div>
      
      <div className="article-items">
        {pages.length === 0 ? (
          <div className="empty-state">
            <p>記事がありません</p>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="article-item"
              onClick={() => handlePageSelect(page)}
            >
              <div className="article-content">
                <h4 className="article-title">
                  {page.frontmatter.title || page.slug}
                </h4>
                <p className="article-description">
                  {page.frontmatter.description || '説明なし'}
                </p>
                <div className="article-meta">
                  <span className="article-date">
                    {new Date(page.updatedAt).toLocaleDateString('ja-JP')}
                  </span>
                  <span className="article-status">
                    {page.status === 'draft' ? '下書き' : 
                     page.status === 'published' ? '公開済み' : 'アーカイブ'}
                  </span>
                </div>
              </div>
              <div className="article-actions">
                <button className="edit-button">編集</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

## 自動保存機能

### 自動保存フック
```typescript
// lib/editor/state.ts
import { useEffect, useState, useCallback } from 'react';
import { updateMarkdownPage } from '@/lib/api/client';

interface UseAutoSaveOptions {
  contentId: string;
  pageId: string;
  markdown: string;
  interval?: number;
  enabled?: boolean;
}

export function useAutoSave({
  contentId,
  pageId,
  markdown,
  interval = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const save = useCallback(async () => {
    if (!enabled || !markdown || !pageId) {
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateMarkdownPage({
        id: pageId,
        contentId,
        body: markdown,
        updatedAt: new Date().toISOString(),
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setError(
        err instanceof Error ? err.message : '保存に失敗しました'
      );
    } finally {
      setIsSaving(false);
    }
  }, [contentId, pageId, markdown, enabled]);
  
  useEffect(() => {
    if (!enabled || !markdown || !pageId) {
      return;
    }
    
    setHasUnsavedChanges(true);
    
    const timeoutId = setTimeout(save, interval);
    
    return () => clearTimeout(timeoutId);
  }, [markdown, save, interval, enabled, pageId]);
  
  const manualSave = useCallback(async () => {
    await save();
  }, [save]);
  
  return {
    isSaving,
    lastSaved,
    error,
    hasUnsavedChanges,
    manualSave,
  };
}
```
