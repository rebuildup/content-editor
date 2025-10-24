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
                lines.push("");
                break;

            case "HeadingTwo":
                lines.push(`## ${extractText(content)}`);
                lines.push("");
                break;

            case "HeadingThree":
                lines.push(`### ${extractText(content)}`);
                lines.push("");
                break;

            case "Paragraph":
                lines.push(extractText(content));
                lines.push("");
                break;

            case "Blockquote":
                lines.push(`> ${extractText(content)}`);
                lines.push("");
                break;

            case "Code":
                {
                    const text = extractText(content);
                    const language = (content[0] as any)?.props?.language || "";
                    lines.push(`\`\`\`${language}`);
                    lines.push(text);
                    lines.push("```");
                    lines.push("");
                }
                break;

            case "BulletedList":
                for (const item of content) {
                    lines.push(`- ${extractText([item])}`);
                }
                lines.push("");
                break;

            case "NumberedList":
                for (let i = 0; i < content.length; i++) {
                    lines.push(`${i + 1}. ${extractText([content[i]])}`);
                }
                lines.push("");
                break;

            case "TodoList":
                for (const item of content) {
                    const checked = (item as any).props?.checked ? "x" : " ";
                    lines.push(`- [${checked}] ${extractText([item])}`);
                }
                lines.push("");
                break;

            case "Link":
                {
                    const text = extractText(content);
                    const url = (content[0] as any)?.props?.url || "";
                    lines.push(`[${text}](${url})`);
                    lines.push("");
                }
                break;

            case "Image":
                {
                    const src = (content[0] as any)?.props?.src || "";
                    const alt = (content[0] as any)?.props?.alt || "";
                    lines.push(`![${alt}](${src})`);
                    lines.push("");
                }
                break;

            case "Video":
                {
                    const src = (content[0] as any)?.props?.src || "";
                    lines.push(`[Video](${src})`);
                    lines.push("");
                }
                break;

            case "Divider":
                lines.push("---");
                lines.push("");
                break;

            case "Callout":
                {
                    const text = extractText(content);
                    lines.push(`> **Note:** ${text}`);
                    lines.push("");
                }
                break;

            case "Table":
                {
                    // テーブルの簡易変換
                    lines.push("| Column | Column |");
                    lines.push("|--------|--------|");
                    lines.push("| Data   | Data   |");
                    lines.push("");
                }
                break;

            case "Accordion":
                {
                    const text = extractText(content);
                    lines.push(`<details>`);
                    lines.push(`<summary>詳細を表示</summary>`);
                    lines.push(text);
                    lines.push(`</details>`);
                    lines.push("");
                }
                break;

            case "Embed":
                {
                    const url = (content[0] as any)?.props?.url || "";
                    lines.push(`[Embed](${url})`);
                    lines.push("");
                }
                break;

            default:
                // その他のブロックは単純にテキストとして扱う
                lines.push(extractText(content));
                lines.push("");
                break;
        }
    }

    return lines.join("\n").trim();
}

/**
 * Yooptaのコンテンツからプレーンテキストを抽出
 */
function extractText(content: any[]): string {
    if (!content || content.length === 0) return "";

    const texts: string[] = [];

    for (const item of content) {
        if (item.children) {
            for (const child of item.children) {
                if (typeof child === "string") {
                    texts.push(child);
                } else if (child.text) {
                    // マークをMarkdownに変換
                    let text = child.text;

                    if (child.bold) text = `**${text}**`;
                    if (child.italic) text = `*${text}*`;
                    if (child.underline) text = `<u>${text}</u>`;
                    if (child.strike) text = `~~${text}~~`;
                    if (child.code) text = `\`${text}\``;
                    if (child.highlight) text = `==${text}==`;

                    texts.push(text);
                }
            }
        }
    }

    return texts.join("");
}

/**
 * MarkdownからYooptaエディタの形式に変換（簡易版）
 */
export function convertMarkdownToYoopta(
    markdown: string,
): YooptaContentValue {
    const lines = markdown.split("\n");
    const blocks: YooptaContentValue = {};
    let order = 0;

    for (const line of lines) {
        if (line.trim() === "") continue;

        const blockId = `block-${Date.now()}-${order}`;
        const textId = `text-${Date.now()}-${order}`;

        // 見出し
        if (line.startsWith("# ")) {
            blocks[blockId] = {
                id: blockId,
                type: "HeadingOne",
                meta: { order, depth: 0 },
                value: [
                    {
                        id: textId,
                        type: "heading-one",
                        children: [{ text: line.substring(2) }],
                    },
                ],
            };
            order++;
            continue;
        }

        if (line.startsWith("## ")) {
            blocks[blockId] = {
                id: blockId,
                type: "HeadingTwo",
                meta: { order, depth: 0 },
                value: [
                    {
                        id: textId,
                        type: "heading-two",
                        children: [{ text: line.substring(3) }],
                    },
                ],
            };
            order++;
            continue;
        }

        if (line.startsWith("### ")) {
            blocks[blockId] = {
                id: blockId,
                type: "HeadingThree",
                meta: { order, depth: 0 },
                value: [
                    {
                        id: textId,
                        type: "heading-three",
                        children: [{ text: line.substring(4) }],
                    },
                ],
            };
            order++;
            continue;
        }

        // 箇条書き
        if (line.startsWith("- ") || line.startsWith("* ")) {
            blocks[blockId] = {
                id: blockId,
                type: "BulletedList",
                meta: { order, depth: 0 },
                value: [
                    {
                        id: textId,
                        type: "bulleted-list",
                        children: [{ text: line.substring(2) }],
                    },
                ],
            };
            order++;
            continue;
        }

        // 引用
        if (line.startsWith("> ")) {
            blocks[blockId] = {
                id: blockId,
                type: "Blockquote",
                meta: { order, depth: 0 },
                value: [
                    {
                        id: textId,
                        type: "blockquote",
                        children: [{ text: line.substring(2) }],
                    },
                ],
            };
            order++;
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
            continue;
        }

        // デフォルトは段落
        blocks[blockId] = {
            id: blockId,
            type: "Paragraph",
            meta: { order, depth: 0 },
            value: [
                {
                    id: textId,
                    type: "paragraph",
                    children: [{ text: line }],
                },
            ],
        };
        order++;
    }

    return blocks;
}

