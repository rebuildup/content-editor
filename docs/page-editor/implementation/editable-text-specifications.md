# エディタブルテキストブロック実装仕様

## 概要

page-editorでは、Monaco Editorの代わりにエディタブルテキストブロックを使用してコンテンツを編集します。各ブロックが独立した編集可能なテキスト要素として機能し、Notionライクな編集体験を提供します。

## エディタブルテキストブロックの実装

### 1. EditableText.tsx

```typescript
import { useRef, useEffect, useState } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function EditableText({ 
  value, 
  onChange, 
  placeholder, 
  className,
  onFocus,
  onBlur 
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);
  
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    onChange(newValue);
  };
  
  const handleFocus = () => {
    setIsEditing(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    onBlur?.();
  };
  
  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`min-h-[1.5rem] focus:outline-none ${className || ''}`}
      suppressContentEditableWarning
      data-placeholder={placeholder}
    />
  );
}
```

### 2. BlockEditor.tsx

```typescript
import { useState, useCallback } from 'react';
import { EditableText } from './EditableText';
import { BlockControls } from './BlockControls';

interface BlockEditorProps {
  blocks: BlockBase[];
  onChange: (blocks: BlockBase[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  
  const updateBlock = useCallback((id: string, content: string) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    onChange(updatedBlocks);
  }, [blocks, onChange]);
  
  const addBlock = useCallback((afterId: string, type: string) => {
    const newBlock: BlockBase = {
      id: generateId(),
      type,
      content: '',
      attributes: {}
    };
    
    const index = blocks.findIndex(b => b.id === afterId);
    const updatedBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1)
    ];
    onChange(updatedBlocks);
  }, [blocks, onChange]);
  
  const deleteBlock = useCallback((id: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    onChange(updatedBlocks);
  }, [blocks, onChange]);
  
  return (
    <div className="block-editor">
      {blocks.map(block => (
        <div key={block.id} className="block-container">
          <BlockControls 
            blockId={block.id}
            onAddBlock={addBlock}
            onDeleteBlock={deleteBlock}
            isFocused={focusedBlockId === block.id}
          />
          <EditableText
            value={block.content}
            onChange={(content) => updateBlock(block.id, content)}
            onFocus={() => setFocusedBlockId(block.id)}
            onBlur={() => setFocusedBlockId(null)}
            placeholder={`${block.type} ブロックを入力...`}
          />
        </div>
      ))}
    </div>
  );
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
```

### 3. BlockControls.tsx

```typescript
import { useState } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';

interface BlockControlsProps {
  blockId: string;
  onAddBlock: (afterId: string, type: string) => void;
  onDeleteBlock: (id: string) => void;
  isFocused: boolean;
}

export function BlockControls({ 
  blockId, 
  onAddBlock, 
  onDeleteBlock, 
  isFocused 
}: BlockControlsProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const blockTypes = [
    { type: 'text', label: 'テキスト' },
    { type: 'heading', label: '見出し' },
    { type: 'list', label: 'リスト' },
    { type: 'quote', label: '引用' },
    { type: 'image', label: '画像' },
    { type: 'video', label: '動画' },
    { type: 'code', label: 'コード' },
    { type: 'callout', label: 'コールアウト' },
  ];
  
  return (
    <div className={`block-controls ${isFocused ? 'visible' : 'hidden'}`}>
      <button
        className="add-block-btn"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="ブロックを追加"
      >
        <Plus size={16} />
      </button>
      
      <button
        className="drag-handle"
        aria-label="ドラッグして移動"
      >
        <GripVertical size={16} />
      </button>
      
      <button
        className="delete-btn"
        onClick={() => onDeleteBlock(blockId)}
        aria-label="ブロックを削除"
      >
        <Trash2 size={16} />
      </button>
      
      {showMenu && (
        <div className="block-menu">
          {blockTypes.map(blockType => (
            <button
              key={blockType.type}
              onClick={() => {
                onAddBlock(blockId, blockType.type);
                setShowMenu(false);
              }}
              className="block-menu-item"
            >
              {blockType.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## データ変換の実装

### 1. Markdown → ブロック変換

```typescript
// lib/conversion/markdown-to-blocks.ts
export function parseMarkdownToBlocks(markdown: string): BlockBase[] {
  const lines = markdown.split('\n');
  const blocks: BlockBase[] = [];
  let currentBlock: BlockBase | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    
    // ブロックタグの解析
    const blockMatch = trimmedLine.match(/^<(\w+)(?:\s+([^>]*))?\/?>$/);
    if (blockMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      
      const [, tagName, attributes] = blockMatch;
      currentBlock = {
        id: generateId(),
        type: tagName.toLowerCase(),
        content: '',
        attributes: parseAttributes(attributes)
      };
      continue;
    }
    
    // 見出しの解析
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      
      const [, hashes, content] = headingMatch;
      currentBlock = {
        id: generateId(),
        type: 'heading',
        content,
        attributes: { level: hashes.length }
      };
      continue;
    }
    
    // リストの解析
    const listMatch = trimmedLine.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      if (currentBlock?.type !== 'list') {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        
        currentBlock = {
          id: generateId(),
          type: 'list',
          content: '',
          attributes: {
            listType: /^\d+\./.test(listMatch[2]) ? 'ordered' : 'unordered',
            items: []
          }
        };
      }
      
      const [, indent, marker, content] = listMatch;
      const item: ListItem = {
        id: generateId(),
        content,
        children: []
      };
      
      (currentBlock.attributes as any).items.push(item);
      continue;
    }
    
    // 通常のテキスト
    if (!currentBlock) {
      currentBlock = {
        id: generateId(),
        type: 'text',
        content: trimmedLine,
        attributes: {}
      };
    } else {
      currentBlock.content += (currentBlock.content ? '\n' : '') + trimmedLine;
    }
  }
  
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  
  return blocks;
}

function parseAttributes(attrString: string): Record<string, unknown> {
  if (!attrString) return {};
  
  const attributes: Record<string, unknown> = {};
  const attrRegex = /(\w+)="([^"]*)"|(\w+)=(\S+)/g;
  let match;
  
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    
    // 型変換
    if (value === 'true') {
      attributes[key] = true;
    } else if (value === 'false') {
      attributes[key] = false;
    } else if (!isNaN(Number(value))) {
      attributes[key] = Number(value);
    } else {
      attributes[key] = value;
    }
  }
  
  return attributes;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
```

### 2. ブロック → Markdown変換

```typescript
// lib/conversion/blocks-to-markdown.ts
export function convertBlocksToMarkdown(blocks: BlockBase[]): string {
  return blocks.map(block => convertBlockToMarkdown(block)).join('\n\n');
}

function convertBlockToMarkdown(block: BlockBase): string {
  switch (block.type) {
    case 'text':
      return block.content;
      
    case 'heading':
      const level = (block.attributes as any)?.level || 1;
      return `${'#'.repeat(level)} ${block.content}`;
      
    case 'list':
      const listType = (block.attributes as any)?.listType || 'unordered';
      const items = (block.attributes as any)?.items || [];
      return items.map((item: ListItem, index: number) => {
        const marker = listType === 'ordered' ? `${index + 1}.` : '-';
        return `${marker} ${item.content}`;
      }).join('\n');
      
    case 'image':
      const imageAttrs = block.attributes as any;
      return `<Image src="${imageAttrs.src}" alt="${imageAttrs.alt}" width="${imageAttrs.width || ''}" height="${imageAttrs.height || ''}" />`;
      
    case 'video':
      const videoAttrs = block.attributes as any;
      return `<Video src="${videoAttrs.src}" width="${videoAttrs.width || ''}" height="${videoAttrs.height || ''}" poster="${videoAttrs.poster || ''}" />${block.content ? `\n${block.content}` : ''}`;
      
    case 'code':
      const codeAttrs = block.attributes as any;
      const language = codeAttrs?.language || '';
      const filename = codeAttrs?.filename || '';
      return `<Code language="${language}" filename="${filename}">\n${block.content}\n</Code>`;
      
    case 'custom':
      const customAttrs = block.attributes as any;
      return `<${customAttrs.tag}>\n${block.content}\n</${customAttrs.tag}>`;
      
    default:
      return `<${block.type}>\n${block.content}\n</${block.type}>`;
  }
}
```

## リアルタイムプレビュー

### PreviewPane.tsx

```typescript
import { useMemo } from 'react';
import { parseMarkdownToBlocks } from '../lib/conversion/markdown-to-blocks';
import { renderBlocks } from '../lib/markdown/renderer';

interface PreviewPaneProps {
  blocks: BlockBase[];
}

export function PreviewPane({ blocks }: PreviewPaneProps) {
  const renderedContent = useMemo(() => {
    // ブロックをMarkdownに変換
    const markdown = convertBlocksToMarkdown(blocks);
    
    // MarkdownをHTMLに変換
    const htmlBlocks = parseMarkdownToBlocks(markdown);
    return renderBlocks(htmlBlocks);
  }, [blocks]);
  
  return (
    <div className="preview-pane">
      <div 
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
}
```

## 自動保存機能

### useAutoSave.ts

```typescript
import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  data: any;
  saveFunction: (data: any) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export function useAutoSave({ 
  data, 
  saveFunction, 
  interval = 2000, 
  enabled = true 
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<any>();
  
  useEffect(() => {
    if (!enabled) return;
    
    // データが変更された場合のみ保存
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return;
    }
    
    // 既存のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 新しいタイムアウトを設定
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction(data);
        lastSavedRef.current = data;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, interval);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, interval, enabled]);
}
```

## アクセシビリティ対応

### キーボードナビゲーション

```typescript
// lib/editor/keyboard-navigation.ts
export function setupKeyboardNavigation(
  editorRef: React.RefObject<HTMLDivElement>,
  blocks: BlockBase[],
  onUpdateBlocks: (blocks: BlockBase[]) => void
) {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigateToPreviousBlock();
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateToNextBlock();
        break;
      case 'Enter':
        if (e.shiftKey) {
          e.preventDefault();
          addBlockBelow();
        }
        break;
      case 'Backspace':
        if (e.target === editorRef.current) {
          e.preventDefault();
          deleteCurrentBlock();
        }
        break;
    }
  };
  
  // キーボードイベントリスナーの設定
  if (editorRef.current) {
    editorRef.current.addEventListener('keydown', handleKeyDown);
  }
  
  return () => {
    if (editorRef.current) {
      editorRef.current.removeEventListener('keydown', handleKeyDown);
    }
  };
}
```

## CSS スタイリング

### block-editor.css

```css
.block-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.block-container {
  position: relative;
  margin: 8px 0;
  padding: 4px 0;
}

.block-controls {
  position: absolute;
  left: -40px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.block-container:hover .block-controls,
.block-controls.visible {
  opacity: 1;
}

.add-block-btn,
.drag-handle,
.delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.add-block-btn:hover,
.drag-handle:hover,
.delete-btn:hover {
  background: #e0e0e0;
}

.block-menu {
  position: absolute;
  left: 32px;
  top: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.block-menu-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.block-menu-item:hover {
  background: #f5f5f5;
}

.preview-pane {
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  background: #fafafa;
}

.preview-content {
  max-width: 100%;
  line-height: 1.6;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .block-controls button {
    background: #333;
    color: white;
  }
  
  .block-controls button:hover {
    background: #444;
  }
  
  .block-menu {
    background: #333;
    border-color: #555;
  }
  
  .block-menu-item {
    color: white;
  }
  
  .block-menu-item:hover {
    background: #444;
  }
  
  .preview-pane {
    background: #1a1a1a;
    border-color: #333;
  }
}
```
