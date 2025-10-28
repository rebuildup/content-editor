# ブロックシステム仕様

## 概要

page-editorのブロックシステムは、Markdown拡張として実装されます。Markdownの標準記法（見出し、リスト、引用、テーブル等）はブロック化せず、Markdown拡張として追加される機能のみをブロックとして実装します。

## ブロックの種類

### 1. レイアウトブロック

#### SpacerBlock（空行・余白）
```markdown
<spacer height="20" />
```

### 2. メディアブロック

#### ImageBlock（画像）
```markdown
<image src="media-id-123" alt="画像の説明" />
```

#### VideoBlock（動画）
```markdown
<video src="media-id-456" poster="media-id-789" />
```

#### AudioBlock（音声）
```markdown
<audio src="media-id-789" />
```

### 3. 埋め込みブロック

#### CustomBlock（カスタムHTML）
```markdown
<custom>
<div class="custom-widget">
  <h3>カスタムコンテンツ</h3>
  <p>任意のHTMLを記述できます</p>
</div>
</custom>
```

### 4. 数式ブロック

#### MathBlock（TeX数式）
```markdown
<math>
E = mc^2
</math>
```

## Markdown標準記法（ブロック化しない）

以下のMarkdown標準記法は、ブロックとして実装せず、通常のMarkdown記法として扱います：

- **見出し**: `# ## ### #### ##### ######`
- **リスト**: `- * +` または `1. 2. 3.`
- **引用**: `>`
- **テーブル**: `| 列1 | 列2 |`
- **コード**: ` ``` ` または ` ` `
- **区切り線**: `---` または `***`
- **強調**: `**太字**` または `*斜体*`
- **リンク**: `[テキスト](URL)`
- **画像**: `![alt](URL)`

## ブロックタグの形式

### 自己完結タグ
```markdown
<block-type attribute1="value1" attribute2="value2" />
```

### ペアタグ
```markdown
<block-type attribute1="value1">
  コンテンツ
</block-type>
```

## 属性の記述方法

### 文字列属性
```markdown
<image src="media-id-123" alt="画像の説明" />
```

### 数値属性
```markdown
<spacer height="20" />
```

### 真偽値属性
```markdown
<video src="media-id-456" autoplay="true" />
```

### 配列属性
```markdown
<gallery images="media-id-1,media-id-2,media-id-3" />
```

## ブロックの実装

### 1. ブロック解析

#### parseBlockTags関数
```typescript
function parseBlockTags(markdown: string): BlockBase[] {
  const blockRegex = /<(\w+)(?:\s+([^>]*))?>(?:([^<]*)<\/\1>)?/g;
  const blocks: BlockBase[] = [];
  let match;
  
  while ((match = blockRegex.exec(markdown)) !== null) {
    const [, type, attributes, content] = match;
    const block: BlockBase = {
      id: generateId(),
      type,
      content: content || '',
      attributes: parseAttributes(attributes || '')
    };
    blocks.push(block);
  }
  
  return blocks;
}
```

#### parseAttributes関数
```typescript
function parseAttributes(attributeString: string): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match;
  
  while ((match = attrRegex.exec(attributeString)) !== null) {
    const [, key, value] = match;
    
    // 数値の判定
    if (!isNaN(Number(value))) {
      attributes[key] = Number(value);
    }
    // 真偽値の判定
    else if (value === 'true' || value === 'false') {
      attributes[key] = value === 'true';
    }
    // 配列の判定
    else if (value.includes(',')) {
      attributes[key] = value.split(',').map(v => v.trim());
    }
    // 文字列
    else {
      attributes[key] = value;
    }
  }
  
  return attributes;
}
```

### 2. ブロックレンダリング

#### BlockRenderer.tsx
```typescript
import { BlockBase } from '@/types/blocks';
import { SpacerBlock } from './SpacerBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { AudioBlock } from './AudioBlock';
import { CustomBlock } from './CustomBlock';
import { MathBlock } from './MathBlock';

interface BlockRendererProps {
  block: BlockBase;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'spacer':
      return <SpacerBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'audio':
      return <AudioBlock block={block} />;
    case 'custom':
      return <CustomBlock block={block} />;
    case 'math':
      return <MathBlock block={block} />;
    default:
      return <div>Unknown block type: {block.type}</div>;
  }
}
```

### 3. 個別ブロックコンポーネント

#### SpacerBlock.tsx
```typescript
interface SpacerBlockProps {
  block: BlockBase;
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  const height = block.attributes?.height || 20;
  
  return (
    <div 
      style={{ height: `${height}px` }}
      className="spacer-block"
    />
  );
}
```

#### ImageBlock.tsx
```typescript
interface ImageBlockProps {
  block: BlockBase;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const src = block.attributes?.src as string;
  const alt = block.attributes?.alt as string;
  
  return (
    <div className="image-block">
      <img 
        src={`/api/media/${src}`}
        alt={alt}
        className="max-w-full h-auto"
      />
    </div>
  );
}
```

#### CustomBlock.tsx
```typescript
interface CustomBlockProps {
  block: BlockBase;
}

export function CustomBlock({ block }: CustomBlockProps) {
  return (
    <div 
      className="custom-block"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}
```

#### MathBlock.tsx
```typescript
import { MathJax } from 'react-mathjax';

interface MathBlockProps {
  block: BlockBase;
}

export function MathBlock({ block }: MathBlockProps) {
  return (
    <div className="math-block">
      <MathJax.Provider>
        <MathJax.Node formula={block.content} />
      </MathJax.Provider>
    </div>
  );
}
```

## ブロックの検証

### 1. 必須属性のチェック
```typescript
function validateBlock(block: BlockBase): boolean {
  switch (block.type) {
    case 'image':
      return !!block.attributes?.src;
    case 'video':
      return !!block.attributes?.src;
    case 'audio':
      return !!block.attributes?.src;
    case 'spacer':
      return typeof block.attributes?.height === 'number';
    default:
      return true;
  }
}
```

### 2. 属性の型チェック
```typescript
function validateAttributes(type: string, attributes: Record<string, unknown>): boolean {
  switch (type) {
    case 'spacer':
      return typeof attributes.height === 'number' && attributes.height > 0;
    case 'image':
    case 'video':
    case 'audio':
      return typeof attributes.src === 'string' && attributes.src.length > 0;
    default:
      return true;
  }
}
```

## ブロックの拡張

### 1. 新しいブロックタイプの追加
```typescript
// 1. 型定義を追加
interface NewBlock extends BlockBase {
  type: 'newblock';
  attributes: {
    customAttr: string;
  };
}

// 2. コンポーネントを作成
export function NewBlock({ block }: { block: NewBlock }) {
  return (
    <div className="new-block">
      {block.attributes.customAttr}
    </div>
  );
}

// 3. BlockRendererに追加
case 'newblock':
  return <NewBlock block={block} />;
```

### 2. ブロックの設定
```typescript
const BLOCK_CONFIG = {
  spacer: {
    name: '空行',
    icon: '📏',
    description: '空行や余白を設定します'
  },
  image: {
    name: '画像',
    icon: '🖼️',
    description: '画像を表示します'
  },
  video: {
    name: '動画',
    icon: '🎥',
    description: '動画を表示します'
  },
  audio: {
    name: '音声',
    icon: '🎵',
    description: '音声を再生します'
  },
  custom: {
    name: 'カスタムHTML',
    icon: '🔧',
    description: '任意のHTMLを記述します'
  },
  math: {
    name: '数式',
    icon: '📐',
    description: 'TeX数式を表示します'
  }
};
```