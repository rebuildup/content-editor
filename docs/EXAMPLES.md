# 使用例集

このドキュメントでは、コンテンツ管理システムの具体的な使用例を紹介します。

## 目次

1. [基本的なCRUD操作](#基本的なcrud操作)
2. [画像の取り扱い](#画像の取り扱い)
3. [Markdownページの管理](#markdownページの管理)
4. [検索機能](#検索機能)
5. [データベース管理](#データベース管理)
6. [高度な使用例](#高度な使用例)

---

## 基本的なCRUD操作

### コンテンツの作成

```typescript
// フロントエンド
const createContent = async () => {
  const content = {
    id: 'blog-post-001',
    title: 'はじめてのブログ投稿',
    summary: 'ブログを始めました！',
    tags: ['blog', 'first-post'],
    lang: 'ja',
    status: 'draft',
    visibility: 'draft',
    seo: {
      metaTitle: 'はじめてのブログ投稿',
      metaDescription: 'ブログを始めました！よろしくお願いします。',
      keywords: ['blog', 'introduction']
    }
  };

  const response = await fetch('/api/contents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });

  const result = await response.json();
  console.log('Created:', result.id);
};
```

### コンテンツの取得

```typescript
// 一覧取得
const fetchAllContents = async () => {
  const response = await fetch('/api/contents');
  const contents = await response.json();
  return contents;
};

// 詳細取得
const fetchContentDetail = async (id: string) => {
  const response = await fetch(`/api/contents?id=${encodeURIComponent(id)}`);
  const content = await response.json();
  return content;
};
```

### コンテンツの更新

```typescript
const updateContent = async (id: string, updates: Partial<Content>) => {
  const response = await fetch('/api/contents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      ...updates
    })
  });

  return await response.json();
};

// 使用例
await updateContent('blog-post-001', {
  title: '更新されたタイトル',
  status: 'published',
  publishedAt: new Date().toISOString()
});
```

### コンテンツの削除

```typescript
const deleteContent = async (id: string) => {
  if (!confirm(`コンテンツ「${id}」を削除しますか？`)) return;

  const response = await fetch(`/api/contents?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });

  return await response.json();
};
```

---

## 画像の取り扱い

### ファイル選択からアップロード

```typescript
// HTML
<input type="file" id="image-upload" accept="image/*" />
<button onclick="uploadImage()">アップロード</button>

// TypeScript
const uploadImage = async () => {
  const input = document.getElementById('image-upload') as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) {
    alert('ファイルを選択してください');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = (e.target?.result as string).split(',')[1];
    
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: 'blog-post-001',
        filename: file.name,
        mimeType: file.type,
        base64Data,
        alt: file.name.replace(/\.[^.]+$/, ''),
        description: 'アップロードされた画像'
      })
    });

    const result = await response.json();
    console.log('Uploaded:', result.id);
  };
  
  reader.readAsDataURL(file);
};
```

### ドラッグ＆ドロップでアップロード

```typescript
// HTML
<div id="drop-zone" style="border: 2px dashed #ccc; padding: 20px;">
  ここに画像をドロップ
</div>

// TypeScript
const dropZone = document.getElementById('drop-zone');

dropZone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.background = '#f0f0f0';
});

dropZone?.addEventListener('dragleave', () => {
  dropZone.style.background = '';
});

dropZone?.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.style.background = '';
  
  const file = e.dataTransfer?.files[0];
  if (!file || !file.type.startsWith('image/')) {
    alert('画像ファイルをドロップしてください');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64Data = (event.target?.result as string).split(',')[1];
    
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: 'blog-post-001',
        filename: file.name,
        mimeType: file.type,
        base64Data
      })
    });

    const result = await response.json();
    console.log('Uploaded:', result.id);
  };
  
  reader.readAsDataURL(file);
});
```

### publicフォルダからインポート

```typescript
const importFromPublic = async (filename: string) => {
  const response = await fetch('/api/media/import-public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId: 'blog-post-001',
      filename,
      alt: filename,
      description: `Imported from public/${filename}`
    })
  });

  return await response.json();
};

// 使用例
await importFromPublic('logo.png');
```

### 画像の表示

```typescript
// React コンポーネント例
const ImageViewer: React.FC<{ contentId: string; mediaId: string }> = ({
  contentId,
  mediaId
}) => {
  const [imageData, setImageData] = useState<string>('');

  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetch(
        `/api/media?contentId=${contentId}&id=${mediaId}`
      );
      const data = await response.json();
      
      if (data.base64) {
        setImageData(`data:${data.mimeType};base64,${data.base64}`);
      }
    };

    fetchImage();
  }, [contentId, mediaId]);

  return imageData ? (
    <img src={imageData} alt="Loaded from database" />
  ) : (
    <div>Loading...</div>
  );
};
```

---

## Markdownページの管理

### Markdownページの作成

```typescript
const createMarkdownPage = async () => {
  const page = {
    contentId: 'blog-post-001',
    slug: 'introduction',
    frontmatter: {
      title: 'はじめに',
      author: 'Admin',
      date: '2025-10-24',
      tags: ['introduction', 'guide']
    },
    body: `# はじめに

このブログへようこそ！

## 目的

このブログでは以下のトピックを扱います：

- プログラミング
- Web開発
- データベース設計

## リンク

詳細は [公式サイト](https://example.com) をご覧ください。

![サンプル画像](/images/sample.jpg)
`,
    lang: 'ja',
    status: 'draft'
  };

  const response = await fetch('/api/markdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page)
  });

  return await response.json();
};
```

### Markdown統計の取得

```typescript
const getMarkdownStats = async (contentId: string, markdownId: string) => {
  const response = await fetch('/api/markdown/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, markdownId })
  });

  const stats = await response.json();
  
  console.log(`文字数: ${stats.characterCount}`);
  console.log(`単語数: ${stats.wordCount}`);
  console.log(`段落数: ${stats.paragraphCount}`);
  console.log(`見出し数: ${stats.headingCount}`);
  
  return stats;
};
```

---

## 検索機能

### 全文検索（コンテンツ）

```typescript
// バックエンド（content-mapper.ts を使用）
import Database from 'better-sqlite3';

const searchContents = (db: Database.Database, query: string) => {
  const stmt = db.prepare(`
    SELECT 
      contents.id,
      contents.title,
      contents.summary,
      snippet(contents_fts, 2, '<mark>', '</mark>', '...', 50) as snippet
    FROM contents_fts
    JOIN contents ON contents.id = contents_fts.id
    WHERE contents_fts MATCH ?
    ORDER BY rank
    LIMIT 10
  `);
  
  return stmt.all(query);
};

// 使用例
const results = searchContents(db, 'リンゴ');
results.forEach(result => {
  console.log(result.title);
  console.log(result.snippet);  // ハイライト付きスニペット
});
```

### タグによるフィルタリング

```typescript
const searchByTag = (db: Database.Database, tag: string) => {
  const stmt = db.prepare(`
    SELECT contents.*
    FROM contents
    JOIN content_tags ON contents.id = content_tags.content_id
    WHERE content_tags.tag = ?
  `);
  
  return stmt.all(tag);
};

// 複数タグ（AND条件）
const searchByMultipleTags = (db: Database.Database, tags: string[]) => {
  const placeholders = tags.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT contents.*, COUNT(*) as match_count
    FROM contents
    JOIN content_tags ON contents.id = content_tags.content_id
    WHERE content_tags.tag IN (${placeholders})
    GROUP BY contents.id
    HAVING match_count = ?
  `);
  
  return stmt.all(...tags, tags.length);
};
```

---

## データベース管理

### データベースのバックアップ

```typescript
const createBackup = async (sourceId: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${sourceId.replace('.db', '')}-backup-${timestamp}`;
  
  const response = await fetch('/api/databases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'copy',
      sourceId,
      targetId: backupName,
      name: `Backup of ${sourceId}`,
      description: `Created at ${new Date().toLocaleString()}`
    })
  });

  return await response.json();
};
```

### データベースの切り替え

```typescript
const switchDatabase = async (dbId: string) => {
  if (!confirm('データベースを切り替えますか？サーバーの再起動が必要です。')) {
    return;
  }

  const response = await fetch('/api/databases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'switch',
      id: dbId
    })
  });

  if (response.ok) {
    alert('データベースを切り替えました。サーバーを再起動してください。');
  }

  return await response.json();
};
```

---

## 高度な使用例

### コンテンツのバージョニング

```typescript
const createNewVersion = async (contentId: string) => {
  // 既存コンテンツを取得
  const response = await fetch(`/api/contents?id=${contentId}`);
  const currentContent = await response.json();
  
  // 新しいバージョンID
  const newVersionId = `${contentId}-v${(currentContent.version || 1) + 1}`;
  
  // 新バージョンを作成
  await fetch('/api/contents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...currentContent,
      id: newVersionId,
      version: (currentContent.version || 1) + 1,
      versionPreviousId: contentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  });
  
  // 元のコンテンツに最新バージョンへの参照を追加
  await fetch('/api/contents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: contentId,
      versionLatestId: newVersionId
    })
  });
  
  return newVersionId;
};
```

### コンテンツの関連付け

```typescript
const linkContents = async (sourceId: string, targetId: string, type: string) => {
  const response = await fetch(`/api/contents?id=${sourceId}`);
  const content = await response.json();
  
  const relations = content.relations || [];
  relations.push({
    targetId,
    type,
    weight: 1.0,
    bidirectional: false
  });
  
  await fetch('/api/contents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: sourceId,
      relations
    })
  });
};

// 使用例：関連記事を設定
await linkContents('blog-post-001', 'blog-post-002', 'related');
await linkContents('blog-post-001', 'blog-post-003', 'related');
```

### 多言語対応

```typescript
const addTranslation = async (contentId: string, lang: string, translation: any) => {
  const response = await fetch(`/api/contents?id=${contentId}`);
  const content = await response.json();
  
  const i18n = content.i18n || {};
  i18n[lang] = translation;
  
  await fetch('/api/contents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: contentId,
      i18n
    })
  });
};

// 使用例
await addTranslation('blog-post-001', 'en', {
  title: 'My First Blog Post',
  summary: 'I started a blog!',
  url: '/en/blog/first-post'
});

await addTranslation('blog-post-001', 'zh', {
  title: '我的第一篇博客',
  summary: '我开始写博客了！',
  url: '/zh/blog/first-post'
});
```

### 一括処理

```typescript
// 複数コンテンツを一括更新
const bulkUpdateStatus = async (contentIds: string[], status: string) => {
  const promises = contentIds.map(id =>
    fetch('/api/contents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status,
        updatedAt: new Date().toISOString()
      })
    })
  );
  
  const results = await Promise.all(promises);
  return results.map(r => r.json());
};

// 使用例：ドラフトを一括公開
await bulkUpdateStatus(
  ['blog-post-001', 'blog-post-002', 'blog-post-003'],
  'published'
);
```

### データのエクスポート/インポート

```typescript
// エクスポート
const exportContent = async (contentId: string) => {
  // コンテンツ取得
  const contentRes = await fetch(`/api/contents?id=${contentId}`);
  const content = await contentRes.json();
  
  // メディア取得
  const mediaRes = await fetch(`/api/media?contentId=${contentId}`);
  const mediaList = await mediaRes.json();
  
  // 各メディアの詳細取得
  const mediaDetails = await Promise.all(
    mediaList.map(async (m: any) => {
      const res = await fetch(`/api/media?contentId=${contentId}&id=${m.id}`);
      return await res.json();
    })
  );
  
  // エクスポートデータ作成
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    content,
    media: mediaDetails
  };
  
  // ダウンロード
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${contentId}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// インポート
const importContent = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // コンテンツをインポート
  await fetch('/api/contents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data.content)
  });
  
  // メディアをインポート
  for (const media of data.media) {
    await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: data.content.id,
        filename: media.filename,
        mimeType: media.mimeType,
        base64Data: media.base64,
        alt: media.alt,
        description: media.description
      })
    });
  }
  
  alert('インポートが完了しました！');
};
```

---

## React フックの例

### useContent フック

```typescript
import { useState, useEffect } from 'react';
import type { Content } from '@/types/content';

export const useContent = (id: string) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contents?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  return { content, loading, error };
};

// 使用例
const MyComponent = ({ contentId }: { contentId: string }) => {
  const { content, loading, error } = useContent(contentId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!content) return <div>Not found</div>;

  return (
    <article>
      <h1>{content.title}</h1>
      <p>{content.summary}</p>
    </article>
  );
};
```

### useMedia フック

```typescript
export const useMedia = (contentId: string, mediaId: string) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(
          `/api/media?contentId=${contentId}&id=${mediaId}`
        );
        const data = await response.json();
        
        if (data.base64) {
          setImageUrl(`data:${data.mimeType};base64,${data.base64}`);
        }
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [contentId, mediaId]);

  return { imageUrl, loading };
};
```

---

これらの例を参考に、プロジェクトのニーズに合わせてカスタマイズしてください！

