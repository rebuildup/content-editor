/**
 * YooptaエディタのコンテンツをMarkdownに変換
 */

import type { YooptaContentValue } from "@yoopta/editor";

export function convertYooptaToMarkdown(value: YooptaContentValue): string {
  const blocks = Object.values(value).sort(
    (a, b) => a.meta.order - b.meta.order,
  );

  const lines: string[] = [];

  for (const block of blocks) {
    const type = block.type;
    const content = block.value;

    // 各ブロックタイプに応じて変換
    switch (type) {
      case "HeadingOne":
        lines.push(`# ${extractText(content)}`);
        break;

      case "HeadingTwo":
        lines.push(`## ${extractText(content)}`);
        break;

      case "HeadingThree":
        lines.push(`### ${extractText(content)}`);
        break;

      case "Paragraph":
        const paragraphText = extractText(content);
        if (paragraphText.trim() === "") {
          // 空の段落は空白行として追加（連続する空行も個別に保持）
          lines.push("");
        } else {
          lines.push(paragraphText);
        }
        break;

      case "Blockquote":
        lines.push(`> ${extractText(content)}`);
        break;

      case "Code":
        {
          const text = extractText(content);
          const language =
            (content[0] as { props?: { language?: string } })?.props
              ?.language || "";
          lines.push(`\`\`\`${language}`);
          lines.push(text);
          lines.push("```");
        }
        break;

      case "BulletedList":
        for (const item of content) {
          lines.push(`- ${extractText([item])}`);
        }
        break;

      case "NumberedList":
        for (let i = 0; i < content.length; i++) {
          lines.push(`${i + 1}. ${extractText([content[i]])}`);
        }
        break;

      case "TodoList":
        for (const item of content) {
          const checked = (item as { props?: { checked?: boolean } }).props
            ?.checked
            ? "x"
            : " ";
          lines.push(`- [${checked}] ${extractText([item])}`);
        }
        break;

      case "Link":
        {
          const text = extractText(content);
          const url =
            (content[0] as { props?: { url?: string } })?.props?.url || "";
          lines.push(`[${text}](${url})`);
        }
        break;

      case "Image":
        {
          const src =
            (content[0] as { props?: { src?: string } })?.props?.src || "";
          const alt =
            (content[0] as { props?: { alt?: string } })?.props?.alt || "";
          lines.push(`![${alt}](${src})`);
        }
        break;

      case "Video":
        {
          const src =
            (content[0] as { props?: { src?: string } })?.props?.src || "";
          lines.push(`[Video](${src})`);
        }
        break;

      case "Divider":
        lines.push("---");
        break;

      case "Callout":
        {
          const text = extractText(content);
          lines.push(`> **Note:** ${text}`);
        }
        break;

      case "Table":
        {
          // テーブルの簡易変換（エラーを避けるため）
          if (content && content.length > 0) {
            const tableData = content as any[];
            if (tableData.length > 0) {
              // ヘッダー行
              const headerRow = tableData[0];
              if (headerRow && headerRow.children) {
                const headerCells = headerRow.children.map((cell: any) =>
                  extractText(cell.children || [])
                );
                lines.push(`| ${headerCells.join(' | ')} |`);
                lines.push(`| ${headerCells.map(() => '---').join(' | ')} |`);

                // データ行（最大5行まで）
                for (let i = 1; i < Math.min(tableData.length, 6); i++) {
                  const row = tableData[i];
                  if (row && row.children) {
                    const rowCells = row.children.map((cell: any) =>
                      extractText(cell.children || [])
                    );
                    lines.push(`| ${rowCells.join(' | ')} |`);
                  }
                }
              }
            }
          }
        }
        break;

      case "Accordion":
        {
          const text = extractText(content);
          lines.push(`<details>`);
          lines.push(`<summary>詳細を表示</summary>`);
          lines.push(text);
          lines.push(`</details>`);
        }
        break;

      case "Embed":
        {
          const url =
            (content[0] as { props?: { url?: string } })?.props?.url || "";
          lines.push(`[Embed](${url})`);
        }
        break;

      default:
        // その他のブロックは単純にテキストとして扱う
        lines.push(extractText(content));
        break;
    }
  }

  // 空行の数を保持（連続する空行も保持）
  const result = lines.join("\n");

  // 空の場合は最低1つの空行を保持
  if (result.trim() === "") {
    return "\n";
  }

  return result;
}

// Yooptaの型定義（Slateの型と互換性を保つ）
interface YooptaNode {
  type?: string;
  text?: string;
  children?: unknown[];
}

/**
 * Yooptaのコンテンツからプレーンテキストを抽出
 */
function extractText(content: YooptaNode[]): string {
  if (!content || content.length === 0) return "";

  const texts: string[] = [];

  for (const item of content) {
    if (item.children) {
      for (const child of item.children) {
        if (typeof child === "string") {
          texts.push(child);
        } else if (
          typeof child === "object" &&
          child !== null &&
          "text" in child
        ) {
          const textNode = child as {
            text: string;
            bold?: boolean;
            italic?: boolean;
            underline?: boolean;
            strike?: boolean;
            code?: boolean;
            highlight?: boolean;
          };
          // マークをMarkdownに変換（複数の書式に対応）
          let text = textNode.text;

          // 書式の優先順位: code > bold > italic > strike > underline > highlight
          if (textNode.code) {
            text = `\`${text}\``;
          } else {
            if (textNode.bold) text = `**${text}**`;
            if (textNode.italic) text = `*${text}*`;
            if (textNode.strike) text = `~~${text}~~`;
            if (textNode.underline) text = `<u>${text}</u>`;
            if (textNode.highlight) text = `==${text}==`;
          }

          texts.push(text);
        }
      }
    } else if (item.text) {
      texts.push(item.text);
    }
  }

  return texts.join("");
}

/**
 * Markdownの書式を解析してYooptaノードに変換
 */
function parseMarkdownFormats(text: string): any[] {
  if (!text) return [{ text: "" }];

  const nodes: any[] = [];
  let currentIndex = 0;

  // 太字の処理
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  const boldMatches: { start: number; end: number; text: string }[] = [];

  while ((match = boldRegex.exec(text)) !== null) {
    boldMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  // 斜体の処理
  const italicRegex = /\*(.*?)\*/g;
  const italicMatches: { start: number; end: number; text: string }[] = [];

  while ((match = italicRegex.exec(text)) !== null) {
    italicMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  // コードの処理
  const codeRegex = /`(.*?)`/g;
  const codeMatches: { start: number; end: number; text: string }[] = [];

  while ((match = codeRegex.exec(text)) !== null) {
    codeMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  // 取り消し線の処理
  const strikeRegex = /~~(.*?)~~/g;
  const strikeMatches: { start: number; end: number; text: string }[] = [];

  while ((match = strikeRegex.exec(text)) !== null) {
    strikeMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  // すべてのマッチを統合してソート
  const allMatches = [
    ...boldMatches.map(m => ({ ...m, type: 'bold' })),
    ...italicMatches.map(m => ({ ...m, type: 'italic' })),
    ...codeMatches.map(m => ({ ...m, type: 'code' })),
    ...strikeMatches.map(m => ({ ...m, type: 'strike' })),
  ].sort((a, b) => a.start - b.start);

  // テキストを分割してノードを作成
  for (let i = 0; i < allMatches.length; i++) {
    const match = allMatches[i];

    // マッチ前のテキスト
    if (currentIndex < match.start) {
      const beforeText = text.substring(currentIndex, match.start);
      if (beforeText) {
        nodes.push({ text: beforeText });
      }
    }

    // マッチしたテキスト
    const node: any = { text: match.text };
    if (match.type === 'bold') node.bold = true;
    if (match.type === 'italic') node.italic = true;
    if (match.type === 'code') node.code = true;
    if (match.type === 'strike') node.strike = true;

    nodes.push(node);
    currentIndex = match.end;
  }

  // 残りのテキスト
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText) {
      nodes.push({ text: remainingText });
    }
  }

  return nodes.length > 0 ? nodes : [{ text }];
}

/**
 * MarkdownからYooptaエディタの形式に変換
 */
export function convertMarkdownToYoopta(markdown: string): YooptaContentValue {
  // 空のMarkdownの場合は空の段落ブロックを返す（最低1つの空行ブロック）
  if (!markdown || markdown.trim() === "") {
    const timestamp = Date.now();
    return {
      "empty-block": {
        id: "empty-block",
        type: "Paragraph",
        meta: { order: 0, depth: 0 },
        value: [
          {
            id: "empty-text",
            type: "paragraph",
            children: [{ text: "", id: `child-${timestamp}-0` }],
          },
        ],
      },
    };
  }

  const lines = markdown.split("\n");
  const blocks: YooptaContentValue = {};
  let order = 0;
  const timestamp = Date.now();
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 空白行は空の段落として扱う（連続する空白行も個別のブロックとして保持）
    if (line.trim() === "") {
      const blockId = `block-${timestamp}-${order}`;
      const textId = `text-${timestamp}-${order}`;

      blocks[blockId] = {
        id: blockId,
        type: "Paragraph",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "paragraph",
            children: [{ text: "", id: `child-${timestamp}-${order}` }],
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    const blockId = `block-${timestamp}-${order}`;
    const textId = `text-${timestamp}-${order}`;

    // 見出し
    if (line.startsWith("# ")) {
      const parsedText = parseMarkdownFormats(line.substring(2));
      blocks[blockId] = {
        id: blockId,
        type: "HeadingOne",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "heading-one",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const parsedText = parseMarkdownFormats(line.substring(3));
      blocks[blockId] = {
        id: blockId,
        type: "HeadingTwo",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "heading-two",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      const parsedText = parseMarkdownFormats(line.substring(4));
      blocks[blockId] = {
        id: blockId,
        type: "HeadingThree",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "heading-three",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // 箇条書き
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const parsedText = parseMarkdownFormats(line.substring(2));
      blocks[blockId] = {
        id: blockId,
        type: "BulletedList",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "bulleted-list",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // 番号付きリスト
    if (/^\d+\.\s/.test(line)) {
      const parsedText = parseMarkdownFormats(line.replace(/^\d+\.\s/, ""));
      blocks[blockId] = {
        id: blockId,
        type: "NumberedList",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "numbered-list",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // TODOリスト
    if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const isChecked = line.startsWith("- [x] ");
      const parsedText = parseMarkdownFormats(line.substring(6));
      blocks[blockId] = {
        id: blockId,
        type: "TodoList",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "todo-list",
            children: parsedText,
            props: { checked: isChecked },
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // 引用
    if (line.startsWith("> ")) {
      const parsedText = parseMarkdownFormats(line.substring(2));
      blocks[blockId] = {
        id: blockId,
        type: "Blockquote",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "blockquote",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // 水平線
    if (line.trim() === "---" || line.trim() === "***") {
      blocks[blockId] = {
        id: blockId,
        type: "Divider",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "divider",
            children: [{ text: "" }],
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // コードブロック
    if (line.startsWith("```")) {
      const language = line.substring(3);
      let codeContent = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeContent += lines[i] + "\n";
        i++;
      }
      blocks[blockId] = {
        id: blockId,
        type: "Code",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "code",
            children: [{ text: codeContent.trim() }],
            props: { language },
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // テーブル（簡易版）
    if (line.includes("|")) {
      const tableRows = [];
      while (i < lines.length && lines[i].includes("|")) {
        const row = lines[i].split("|").map(cell => cell.trim()).filter(cell => cell);
        tableRows.push(row);
        i++;
      }

      if (tableRows.length > 0) {
        // テーブルを簡易的な段落として扱う（エラーを避けるため）
        const tableText = tableRows.map(row => row.join(" | ")).join("\n");
        const parsedText = parseMarkdownFormats(tableText);
        blocks[blockId] = {
          id: blockId,
          type: "Paragraph",
          meta: { order, depth: 0 },
          value: [
            {
              id: textId,
              type: "paragraph",
              children: parsedText,
            },
          ],
        };
        order++;
        i++;
        continue;
      }
    }

    // アコーディオン（HTML details）
    if (line.startsWith("<details>")) {
      let accordionContent = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("</details>")) {
        accordionContent += lines[i] + "\n";
        i++;
      }
      const parsedText = parseMarkdownFormats(accordionContent.trim());
      blocks[blockId] = {
        id: blockId,
        type: "Accordion",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "accordion",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // コールアウト
    if (line.startsWith("> **Note:**") || line.startsWith("> **Warning:**") || line.startsWith("> **Info:**")) {
      const parsedText = parseMarkdownFormats(line.substring(2));
      blocks[blockId] = {
        id: blockId,
        type: "Callout",
        meta: { order, depth: 0 },
        value: [
          {
            id: textId,
            type: "callout",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // 画像
    if (line.startsWith("![")) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        const [, alt, src] = match;
        blocks[blockId] = {
          id: blockId,
          type: "Image",
          meta: { order, depth: 0 },
          value: [
            {
              id: textId,
              type: "image",
              children: [{ text: "" }],
              props: { src, alt },
            },
          ],
        };
        order++;
        i++;
        continue;
      }
    }

    // 動画
    if (line.startsWith("[Video](")) {
      const match = line.match(/\[Video\]\(([^)]+)\)/);
      if (match) {
        const [, src] = match;
        blocks[blockId] = {
          id: blockId,
          type: "Video",
          meta: { order, depth: 0 },
          value: [
            {
              id: textId,
              type: "video",
              children: [{ text: "" }],
              props: { src },
            },
          ],
        };
        order++;
        i++;
        continue;
      }
    }

    // ファイル
    if (line.startsWith("[File](")) {
      const match = line.match(/\[File\]\(([^)]+)\)/);
      if (match) {
        const [, src] = match;
        blocks[blockId] = {
          id: blockId,
          type: "File",
          meta: { order, depth: 0 },
          value: [
            {
              id: textId,
              type: "file",
              children: [{ text: "" }],
              props: { src },
            },
          ],
        };
        order++;
        i++;
        continue;
      }
    }

    // 埋め込み
    if (line.startsWith("[Embed](")) {
      const match = line.match(/\[Embed\]\(([^)]+)\)/);
      if (match) {
        const [, url] = match;
        blocks[blockId] = {
          id: blockId,
          type: "Embed",
          meta: { order, depth: 0 },
          value: [
            {
              id: textId,
              type: "embed",
              children: [{ text: "" }],
              props: { url },
            },
          ],
        };
        order++;
        i++;
        continue;
      }
    }

    // デフォルトは段落（書式解析付き）
    const parsedText = parseMarkdownFormats(line);
    blocks[blockId] = {
      id: blockId,
      type: "Paragraph",
      meta: { order, depth: 0 },
      value: [
        {
          id: textId,
          type: "paragraph",
          children: parsedText,
        },
      ],
    };
    order++;
    i++;
  }

  return blocks;
}
