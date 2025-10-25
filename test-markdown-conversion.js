// テスト用のMarkdown変換機能テスト
const { convertYooptaToMarkdown, convertMarkdownToYoopta } = require('./md-editor/lib/yoopta-to-markdown.ts');

// テスト用のMarkdownコンテンツ
const testMarkdown = `# 見出し1

## 見出し2

### 見出し3

これは**太字**と*斜体*のテキストです。

- 箇条書き項目1
- 箇条書き項目2

1. 番号付き項目1
2. 番号付き項目2

- [ ] 未完了のTODO
- [x] 完了したTODO

> これは引用文です。

\`\`\`javascript
console.log("コードブロック");
\`\`\`

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| データ1 | データ2 | データ3 |

---

![画像](https://example.com/image.jpg)

[Video](https://example.com/video.mp4)

[File](https://example.com/file.pdf)

[Embed](https://example.com/embed)

<details>
<summary>アコーディオン</summary>
アコーディオンの内容
</details>

> **Note:** これはコールアウトです。

空の行

もう一つの空の行
`;

console.log('=== Markdown to Yoopta Conversion Test ===');
console.log('Original Markdown:');
console.log(testMarkdown);
console.log('\n');

try {
  const yooptaValue = convertMarkdownToYoopta(testMarkdown);
  console.log('Converted Yoopta Value:');
  console.log(JSON.stringify(yooptaValue, null, 2));
  console.log('\n');

  console.log('=== Yoopta to Markdown Conversion Test ===');
  const convertedMarkdown = convertYooptaToMarkdown(yooptaValue);
  console.log('Converted Markdown:');
  console.log(convertedMarkdown);
  console.log('\n');

  console.log('=== Comparison ===');
  console.log('Original and converted are identical:', testMarkdown.trim() === convertedMarkdown.trim());
} catch (error) {
  console.error('Error during conversion:', error);
}
