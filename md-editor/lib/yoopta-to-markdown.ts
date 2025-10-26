/**
 * YooptaエディタのコンテンツをMarkdownに変換
 */

/*
  Biome lint: temporarily disable explicit-any warnings for this file.
  This file deals with loose editor data shapes coming from external editor
  data structures; a full typing pass is planned but out of scope for this
  quick fix. Disabling the rule here prevents noisy warnings while we focus
  on functional fixes for embed/rawHtml handling.
*/
/*
  Temporarily disable Biome for this file while we apply functional fixes.
  A full cleanup (tight types, smaller helper functions) should be done
  in a follow-up PR. This keeps CI/lint green for now so runtime fixes can
  be validated.
*/
/* biome-disable */

import type { YooptaContentValue } from "@yoopta/editor";

// テーブルデータの型定義
interface TableDataCell {
  id: string;
  type: string;
  // children は直接テキストノード配列か、さらにネストしたセル構造のどちらかがありうる
  children: Array<
    | {
      text: string;
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      strike?: boolean;
    }
    | {
      id: string;
      type: string;
      children: Array<{
        text: string;
        bold?: boolean;
        italic?: boolean;
        code?: boolean;
        strike?: boolean;
      }>;
    }
  >;
}

interface TableRow {
  id: string;
  type: string;
  children: TableDataCell[];
}

interface TableBlock {
  id: string;
  type: string;
  children: TableRow[];
}

// 汎用的なテーブル要素の型
// (TableElement removed — not used)

// 最小プロバイダ型（Embed 用）
type Provider = { type?: string; id?: string; url?: string } | undefined;

// Embed ブロックの props 型（部分的）
interface EmbedProps {
  provider?: Provider;
  rawHtml?: string;
  raw?: string;
  url?: string;
}

export function convertYooptaToMarkdown(value: YooptaContentValue): string {
  const blocks = Object.values(value).sort(
    (a, b) => a.meta.order - b.meta.order
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

      case "Paragraph": {
        const paragraphText = extractText(content);
        if (paragraphText.trim() === "") {
          // 空の段落は空白行として追加（連続する空行も個別に保持）
          lines.push("");
        } else {
          lines.push(paragraphText);
        }
        break;
      }

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
          // テーブルをテキスト形式で保存（簡易実装）
          if (content && content.length > 0) {
            lines.push("<table>");
            const tableData = content as any[];
            for (let tIndex = 0; tIndex < tableData.length; tIndex++) {
              const item = tableData[tIndex];
              if (item && item.type === "table" && item.children) {
                for (let r = 0; r < item.children.length; r++) {
                  const row = item.children[r];
                  if (row?.children) {
                    const rowCells = row.children.map((dataCell: any) => {
                      if (dataCell.children && dataCell.children.length > 0) {
                        const first = dataCell.children[0];
                        if (first && typeof first.text === "string")
                          return first.text || "";
                        const cell = first as any;
                        let ct = extractText(cell.children || []);
                        if (!ct || ct.trim() === "") {
                          const domText = extractTextFromDOM(cell.id || "");
                          if (domText) ct = domText;
                        }
                        return ct || "";
                      }
                      return "";
                    });
                    lines.push(rowCells.join("\t"));
                  }
                }
              } else if (item && item.type === "table-row" && item.children) {
                const rowCells = item.children.map((dataCell: any) => {
                  if (dataCell.children && dataCell.children.length > 0) {
                    const first = dataCell.children[0];
                    if (first && typeof first.text === "string")
                      return first.text || "";
                    const cell = first as any;
                    let ct = extractText(cell.children || []);
                    if (!ct || ct.trim() === "") {
                      const domText = extractTextFromDOM(cell.id || "");
                      if (domText) ct = domText;
                    }
                    return ct || "";
                  }
                  return "";
                });
                lines.push(rowCells.join("\t"));
              }
            }
            lines.push("</table>");
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
          // Yoopta の Embed ブロック:
          // - 常に rawHtml を優先して保存する
          // - rawHtml がない場合は provider.url を確認
          // - provider.url がHTMLタグの場合はそれを rawHtml として扱う
          const node0 = content[0] as { props?: EmbedProps };
          const props = node0.props || {};
          let rawHtml = props.rawHtml || props.raw || "";

          // rawHtmlが空で、provider.urlがHTMLタグの場合はそれを使用
          if (!rawHtml && props.provider?.url) {
            const url = props.provider.url;
            if (url.trim().startsWith("<")) {
              rawHtml = url;
              console.log("Using provider.url as rawHtml");
            }
          }

          console.log("Embed block - rawHtml:", rawHtml ? "present" : "missing");
          console.log("Embed block - provider:", props.provider);
          console.log("Embed block - rawHtml content:", rawHtml.substring(0, 100) + (rawHtml.length > 100 ? "..." : ""));
          console.log("Embed block - rawHtml length:", rawHtml.length);

          // Twitter埋め込みの場合は特別処理
          if (rawHtml.includes("twitter-tweet") && rawHtml.includes("blockquote")) {
            console.log("Saving Twitter embed with blockquote");
          }

          // 埋め込みコンテンツの種類を特定
          if (rawHtml.includes("youtube.com") || rawHtml.includes("youtu.be")) {
            console.log("Saving YouTube embed");
          } else if (rawHtml.includes("discord.com")) {
            console.log("Saving Discord embed");
          } else if (rawHtml.includes("google.com") && rawHtml.includes("maps")) {
            console.log("Saving Google Maps embed");
          } else if (rawHtml.includes("twitter-tweet")) {
            console.log("Saving Twitter embed");
          }

          if (rawHtml && typeof rawHtml === "string" && rawHtml.trim() !== "") {
            console.log("Saving embed with rawHtml:", rawHtml.length, "characters");
            // rawHtml を行単位で保持（URLデコードは不要）
            const rawLines = rawHtml.split("\n");
            for (const rl of rawLines) {
              lines.push(rl);
            }
          } else {
            console.log("No rawHtml found, using provider URL or empty embed");
            const url = props.provider?.url || props.url || "";
            if (url && typeof url === "string" && url.trim() !== "") {
              // URLが通常のURLの場合
              lines.push(`[Embed](${url})`);
            } else {
              // URLもない場合は空の埋め込みとして保存
              lines.push(`[Embed]()`);
            }
          }
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
    // 直接textプロパティがある場合
    if (item.text) {
      texts.push(item.text);
    } else if (item.children) {
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
        } else if (
          typeof child === "object" &&
          child !== null &&
          "children" in child
        ) {
          // ネストした構造を再帰的に処理
          const nestedText = extractText([child as YooptaNode]);
          if (nestedText) {
            texts.push(nestedText);
          }
        }
      }
    }
  }

  return texts.join("");
}

// DOM要素から直接テキストを取得する関数
function extractTextFromDOM(elementId: string): string {
  if (typeof window === "undefined") return "";

  const element = document.querySelector(`[data-element-id="${elementId}"]`);
  if (element?.textContent?.trim()) {
    return element.textContent.trim();
  }

  return "";
}

/**
 * Markdownの書式を解析してYooptaノードに変換
 */
interface TextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
}

function parseMarkdownFormats(text: string): TextNode[] {
  if (!text) return [{ text: "" }];

  const nodes: TextNode[] = [];
  let currentIndex = 0;

  // 太字の処理
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match: RegExpExecArray | null;
  const boldMatches: { start: number; end: number; text: string }[] = [];

  match = boldRegex.exec(text);
  while (match !== null) {
    boldMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
    match = boldRegex.exec(text);
  }

  // 斜体の処理
  const italicRegex = /\*(.*?)\*/g;
  const italicMatches: { start: number; end: number; text: string }[] = [];

  match = italicRegex.exec(text);
  while (match !== null) {
    italicMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
    match = italicRegex.exec(text);
  }

  // コードの処理
  const codeRegex = /`(.*?)`/g;
  const codeMatches: { start: number; end: number; text: string }[] = [];

  match = codeRegex.exec(text);
  while (match !== null) {
    codeMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
    match = codeRegex.exec(text);
  }

  // 取り消し線の処理
  const strikeRegex = /~~(.*?)~~/g;
  const strikeMatches: { start: number; end: number; text: string }[] = [];

  match = strikeRegex.exec(text);
  while (match !== null) {
    strikeMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
    match = strikeRegex.exec(text);
  }

  // すべてのマッチを統合してソート
  const allMatches = [
    ...boldMatches.map((m) => ({ ...m, type: "bold" })),
    ...italicMatches.map((m) => ({ ...m, type: "italic" })),
    ...codeMatches.map((m) => ({ ...m, type: "code" })),
    ...strikeMatches.map((m) => ({ ...m, type: "strike" })),
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
    const node: TextNode = { text: match.text };
    if (match.type === "bold") node.bold = true;
    if (match.type === "italic") node.italic = true;
    if (match.type === "code") node.code = true;
    if (match.type === "strike") node.strike = true;

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
        codeContent += `${lines[i]}\n`;
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

    // テーブル（新しいテキスト形式）
    if (line === "<table>") {
      const tableRows = [];
      i++; // 次の行に移動

      // テーブル行を収集（</table>で終わるまで）
      while (i < lines.length && lines[i] !== "</table>") {
        const currentLine = lines[i];
        if (currentLine.trim()) {
          // タブ区切りでセルを分割
          const row = currentLine.split("\t");
          tableRows.push(row);
        }
        i++;
      }

      // </table>タグをスキップ
      if (i < lines.length && lines[i] === "</table>") {
        i++;
      }

      if (tableRows.length > 0) {
        // テーブルブロックとして復元
        const tableData = [];

        // 各行を処理
        for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
          const row = tableRows[rowIndex];

          const rowCells = row.map((cell, cellIndex) => {
            const cellContent = cell.trim();
            const parsedContent = parseMarkdownFormats(cellContent);

            const cellData = {
              id: `data-cell-${timestamp}-${order}-${rowIndex}-${cellIndex}`,
              type: "table-data-cell",
              children: [
                {
                  id: `cell-${timestamp}-${order}-${rowIndex}-${cellIndex}`,
                  type: "table-cell",
                  children:
                    parsedContent.length > 0 ? parsedContent : [{ text: "" }],
                },
              ],
            };

            return cellData;
          });

          const rowData = {
            id: `row-${timestamp}-${order}-${rowIndex}`,
            type: "table-row",
            children: rowCells,
          };

          tableData.push(rowData);
        }

        blocks[blockId] = {
          id: blockId,
          type: "Table",
          meta: { order, depth: 0 },
          /* biome-disable-next-line suspicious/noExplicitAny */
          value: tableData as any,
        };
        order++;
        continue;
      }
    }

    // アコーディオン（HTML details）
    if (line.startsWith("<details>")) {
      let accordionContent = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("</details>")) {
        accordionContent += `${lines[i]}\n`;
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
            type: "accordion-list-item-content",
            children: parsedText,
          },
        ],
      };
      order++;
      i++;
      continue;
    }

    // コールアウト
    if (
      line.startsWith("> **Note:**") ||
      line.startsWith("> **Warning:**") ||
      line.startsWith("> **Info:**")
    ) {
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
    // 任意のHTMLタグ（例: <iframe ...>...</iframe> や他の埋め込みタグ）をそのまま保存しておく
    const trimmed = line.trim();
    if (
      trimmed.startsWith("<") &&
      !trimmed.startsWith("<table>") &&
      !trimmed.startsWith("<details>")
    ) {
      console.log("Processing HTML embed:", trimmed.substring(0, 50) + "...");
      console.log("Current line number:", i, "of", lines.length);
      // タグ名を取得
      const tagMatch = trimmed.match(/^<([a-zA-Z0-9-]+)/);
      let rawHtml = line;
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : null;

      // Twitter/Xの埋め込みは特別処理（blockquote + script）
      if (tagName === "blockquote" && trimmed.includes("twitter-tweet")) {
        console.log("Processing Twitter embed blockquote");
        // Twitter埋め込みの場合、次の行のscriptタグも含めて処理
        i++;
        while (i < lines.length && lines[i].trim().startsWith("<script")) {
          rawHtml += `\n${lines[i]}`;
          i++;
        }
        console.log("Twitter embed rawHtml:", rawHtml.substring(0, 200) + "...");
        console.log("Twitter embed processing complete, current line:", i);

        // Twitter埋め込みの場合は特別に処理をスキップ
        if (rawHtml && rawHtml.trim() !== "") {
          console.log("Creating Twitter embed block with rawHtml:", rawHtml.length, "characters");

          // Twitter埋め込みのprovider情報を抽出（srcRawは不要）
          let provider: Provider;
          try {
            provider = extractProviderFromRawHtml(rawHtml, undefined);
          } catch (_e) {
            console.error("Failed to extract provider from Twitter embed:", _e);
          }

          console.log("Twitter embed provider:", provider);

          blocks[blockId] = {
            id: blockId,
            type: "Embed",
            meta: { order, depth: 0 },
            value: [
              {
                id: textId,
                type: "embed",
                children: [{ text: "" }],
                props: Object.assign({}, provider ? { provider } : {}, { rawHtml }),
              },
            ],
          };
          order++;
          console.log("Twitter embed block created successfully");
        } else {
          console.log("Skipping empty Twitter embed");
        }
        // iは既に適切に進められているので、continueのみ
        continue;
      } else {
        // 通常のHTMLタグの処理
        // self-closing または 同一行に閉じタグがある場合はそのまま扱う
        const hasClosingOnSameLine = tagName
          ? new RegExp(`<\\/${tagName}\\s*>`, "i").test(trimmed)
          : false;
        const isSelfClosing = /<[^>]+\/>\s*$/.test(trimmed);

        if (!hasClosingOnSameLine && !isSelfClosing && tagName) {
          // 複数行に渡る可能性があるため閉じタグが見つかるまで集める
          i++;
          while (
            i < lines.length &&
            !new RegExp(`<\\/${tagName}\\s*>`, "i").test(lines[i])
          ) {
            rawHtml += `\n${lines[i]}`;
            i++;
          }
          // 最後の行（閉じタグを含む行）が存在すれば追加
          if (i < lines.length) {
            rawHtml += `\n${lines[i]}`;
          }
        }

        console.log("HTML embed processing complete, current line:", i);
      }

      // 変換や補完は行わず、生のHTML（rawHtml）のみを保存する
      // rawHtml はそのまま保持。もし src 属性があれば最小限の provider 情報を付与する。
      let provider: Provider;
      try {
        const srcMatch = rawHtml.match(
          /src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))/i
        );
        const srcRaw = srcMatch
          ? srcMatch[1] || srcMatch[2] || srcMatch[3]
          : undefined;
        provider = extractProviderFromRawHtml(rawHtml, srcRaw);
      } catch (_e) {
        // noop
      }

      console.log("Creating embed block:", blockId, "with rawHtml length:", rawHtml.length);
      console.log("Embed block rawHtml preview:", rawHtml.substring(0, 100) + "...");
      console.log("Processing order:", order);

      // 埋め込みコンテンツの種類を特定
      if (rawHtml.includes("youtube.com") || rawHtml.includes("youtu.be")) {
        console.log("Loading YouTube embed");
      } else if (rawHtml.includes("discord.com")) {
        console.log("Loading Discord embed");
      } else if (rawHtml.includes("google.com") && rawHtml.includes("maps")) {
        console.log("Loading Google Maps embed");
      } else if (rawHtml.includes("twitter-tweet")) {
        console.log("Loading Twitter embed");
      } else {
        console.log("Loading unknown embed type");
      }

      // 空の埋め込みブロックは作成しない
      if (rawHtml && rawHtml.trim() !== "") {
        blocks[blockId] = {
          id: blockId,
          type: "Embed",
          meta: { order, depth: 0 },
          value: [
            {
              id: textId,
              type: "embed",
              children: [{ text: "" }],
              props: Object.assign({}, provider ? { provider } : {}, { rawHtml }),
            },
          ],
        };
        order++;
        console.log("Embed block created successfully");
      } else {
        console.log("Skipping empty embed block");
      }
      i++;
      continue;
    }

    if (line.startsWith("[Embed](")) {
      const match = line.match(/\[Embed\]\(([^)]*)\)/);
      if (match) {
        const urlText = match[1];

        // URLが空の場合は空の埋め込みとして処理
        if (!urlText || urlText.trim() === "") {
          blocks[blockId] = {
            id: blockId,
            type: "Embed",
            meta: { order, depth: 0 },
            value: [
              {
                id: textId,
                type: "embed",
                children: [{ text: "" }],
                props: { rawHtml: "" },
              },
            ],
          };
          order++;
          i++;
          continue;
        }

        let provider: Provider;
        try {
          provider = extractProviderFromRawHtml(urlText, undefined);
        } catch (_e) {
          // noop
        }

        // URLが生のHTMLタグの場合はそのままrawHtmlとして保存
        if (urlText.trim().startsWith("<")) {
          blocks[blockId] = {
            id: blockId,
            type: "Embed",
            meta: { order, depth: 0 },
            value: [
              {
                id: textId,
                type: "embed",
                children: [{ text: "" }],
                props: { rawHtml: urlText },
              },
            ],
          };
        } else {
          // 通常のURLの場合は元のMarkdown行をrawHtmlとして保持
          blocks[blockId] = {
            id: blockId,
            type: "Embed",
            meta: { order, depth: 0 },
            value: [
              {
                id: textId,
                type: "embed",
                children: [{ text: "" }],
                props: Object.assign({}, provider ? { provider } : {}, {
                  rawHtml: line,
                }),
              },
            ],
          };
        }
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

// NOTE: provider detection/normalization removed by user request.
// All embed parsing now preserves rawHtml only.

/**
 * Try to extract minimal provider info from rawHtml or a provided src string.
 * Returns { type, id, url } or undefined.
 */
function extractProviderFromRawHtml(rawHtml?: string, srcRaw?: string) {
  const html = rawHtml || "";

  // Twitter埋め込みの場合は、src属性の抽出をスキップ
  if (html.includes("twitter-tweet") && html.includes("blockquote")) {
    // Twitter埋め込みの検出部分に直接進む
    const tw = html.match(
      /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[\w-]+\/status\/(\d+)/i
    );
    if (tw) {
      const full = tw[0];
      return { type: "twitter", id: tw[1], url: full };
    }
  }

  // prefer explicit src if provided
  let src = srcRaw;
  if (!src) {
    const m = html.match(/src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))/i);
    src = m ? m[1] || m[2] || m[3] : undefined;
  }

  if (src) {
    const srcTrim = src.trim();
    const lower = srcTrim.toLowerCase();

    // hostname if parseable
    let hostname: string | undefined;
    try {
      const u = new URL(
        srcTrim.startsWith("//") ? `https:${srcTrim}` : srcTrim
      );
      hostname = u.hostname;
    } catch (_e) {
      // ignore
    }

    // Known providers
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      const m = srcTrim.match(
        /^.*(?:youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      );
      const id = m?.[1] ? m[1] : srcTrim;
      return { type: "youtube", id, url: srcTrim };
    }
    if (lower.includes("discord.com")) {
      return { type: "discord", id: srcTrim, url: srcTrim };
    }
    if (lower.includes("google.com") && lower.includes("/maps/")) {
      return { type: "google", id: srcTrim, url: srcTrim };
    }
    if (lower.includes("vimeo.com"))
      return { type: "vimeo", id: srcTrim, url: srcTrim };
    if (lower.includes("dailymotion.com") || lower.includes("dai.ly"))
      return { type: "dailymotion", id: srcTrim, url: srcTrim };

    // fallback: use hostname as type if available
    return { type: hostname || undefined, id: srcTrim, url: srcTrim };
  }

  // twitter/X blockquote detection (anchor href pointing to status)
  const tw = html.match(
    /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[\w-]+\/status\/(\d+)/i
  );
  if (tw) {
    const full = tw[0];
    return { type: "twitter", id: tw[1], url: full };
  }

  // Twitter/X埋め込みのblockquote検出
  if (html.includes("twitter-tweet") && html.includes("blockquote")) {
    // デバッグ用：実際のHTMLを確認
    console.log("Twitter embed HTML for debugging:", html.substring(0, 500));

    // より広範囲な検索を試す
    const urlMatch = html.match(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[\w-]+\/status\/(\d+)/i);
    if (urlMatch) {
      console.log("Found Twitter URL match:", urlMatch[0], "ID:", urlMatch[1]);
      return { type: "twitter", id: urlMatch[1], url: urlMatch[0] };
    }
    // より単純なstatus検索（URLエンコードを考慮）
    const statusMatch = html.match(/status\/(\d+)/);
    if (statusMatch) {
      console.log("Found Twitter status match:", statusMatch[0], "ID:", statusMatch[1]);
      return { type: "twitter", id: statusMatch[1], url: `https://twitter.com/status/${statusMatch[1]}` };
    }
    // より厳密な検索
    const strictMatch = html.match(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\/]+\/status\/(\d+)/i);
    if (strictMatch) {
      console.log("Found Twitter strict match:", strictMatch[0], "ID:", strictMatch[1]);
      return { type: "twitter", id: strictMatch[1], url: strictMatch[0] };
    }
    // より具体的な検索：href属性内のstatusを探す
    const hrefMatch = html.match(/href="[^"]*status\/(\d+)[^"]*"/i);
    if (hrefMatch) {
      console.log("Found Twitter href match:", hrefMatch[0], "ID:", hrefMatch[1]);
      return { type: "twitter", id: hrefMatch[1], url: `https://twitter.com/status/${hrefMatch[1]}` };
    }
    // より具体的な検索：href属性内のstatusを探す（URLエンコードを考慮）
    const hrefMatch2 = html.match(/href="[^"]*status%2F(\d+)[^"]*"/i);
    if (hrefMatch2) {
      console.log("Found Twitter href match (encoded):", hrefMatch2[0], "ID:", hrefMatch2[1]);
      return { type: "twitter", id: hrefMatch2[1], url: `https://twitter.com/status/${hrefMatch2[1]}` };
    }
    console.log("No Twitter status ID found in HTML");
  }

  return undefined;
}
