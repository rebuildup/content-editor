import { nanoid } from "nanoid";
import type { Block, BlockType, ListItem } from "@/types/blocks";

const DEFAULT_ICON = "!";

function formatList(
  items: ListItem[] = [],
  ordered: boolean,
  depth = 0,
): string[] {
  const lines: string[] = [];
  items.forEach((item, index) => {
    const prefix = ordered ? `${index + 1}. ` : "- ";
    const indent = "  ".repeat(depth);
    const checkbox =
      typeof item.checked === "boolean" ? `[${item.checked ? "x" : " "}] ` : "";
    lines.push(`${indent}${prefix}${checkbox}${item.content}`.trimEnd());
    if (item.children && item.children.length > 0) {
      lines.push(...formatList(item.children, ordered, depth + 1));
    }
  });
  return lines;
}

function escapeText(text: string): string {
  return text.replace(/\r?\n/g, "\n");
}

export function convertBlocksToMarkdown(blocks: Block[]): string {
  // 各ブロックを単位として文字列化し、ブロック間のみ空行で区切る
  const chunks: string[] = [];

  blocks.forEach((block) => {
    const blockLines: string[] = [];
    switch (block.type) {
      case "paragraph": {
        blockLines.push(escapeText(block.content));
        break;
      }
      case "heading": {
        const level = Number(block.attributes.level ?? 1);
        const prefix = "#".repeat(Math.min(Math.max(level, 1), 6));
        blockLines.push(`${prefix} ${escapeText(block.content)}`.trim());
        break;
      }
      case "quote": {
        const quoteLines = block.content
          .split(/\r?\n/)
          .map((line) => `> ${line}`.trimEnd());
        blockLines.push(...quoteLines);
        if (block.attributes.citation) {
          blockLines.push(`> — ${block.attributes.citation}`);
        }
        break;
      }
      case "callout": {
        const type = block.attributes.type ?? "info";
        const icon =
          (block.attributes.icon as string | undefined) ?? DEFAULT_ICON;
        blockLines.push(`<Callout type="${type}" icon="${icon}">`);
        blockLines.push(block.content);
        blockLines.push("</Callout>");
        break;
      }
      case "divider": {
        blockLines.push("---");
        break;
      }
      case "spacer": {
        const height = block.attributes.height ?? 24;
        blockLines.push(`<Spacer height="${height}" />`);
        break;
      }
      case "list": {
        const items = Array.isArray(block.attributes.items)
          ? (block.attributes.items as ListItem[])
          : [];
        const ordered = Boolean(block.attributes.ordered);
        blockLines.push(...formatList(items, ordered));
        break;
      }
      case "code": {
        const language =
          (block.attributes.language as string | undefined) ?? "";
        const fence = language ? `\`\`\`${language}` : "```";
        blockLines.push(fence);
        blockLines.push(block.content);
        blockLines.push("```");
        break;
      }
      case "math": {
        blockLines.push("<Math>");
        blockLines.push(block.content);
        blockLines.push("</Math>");
        break;
      }
      case "toggle": {
        const summary = block.attributes.summary ?? "Details";
        blockLines.push(`<Toggle summary="${summary}">`);
        if (block.children && block.children.length > 0) {
          blockLines.push(convertBlocksToMarkdown(block.children));
        } else {
          blockLines.push(block.content);
        }
        blockLines.push("</Toggle>");
        break;
      }
      case "image": {
        const src = block.attributes.src ?? "";
        const alt = block.attributes.alt ?? "";
        const width = block.attributes.width
          ? ` width="${block.attributes.width}"`
          : "";
        const height = block.attributes.height
          ? ` height="${block.attributes.height}"`
          : "";
        blockLines.push(
          `<Image src="${src}" alt="${alt}"${width}${height}>${block.content}</Image>`,
        );
        break;
      }
      case "video": {
        const src = block.attributes.src ?? "";
        const poster = block.attributes.poster
          ? ` poster="${block.attributes.poster}"`
          : "";
        const autoplay = block.attributes.autoplay ? " autoplay" : "";
        const controls = block.attributes.controls === false ? "" : " controls";
        blockLines.push(
          `<Video src="${src}"${poster}${controls}${autoplay}>${block.content}</Video>`,
        );
        break;
      }
      case "audio": {
        const src = block.attributes.src ?? "";
        const autoplay = block.attributes.autoplay ? " autoplay" : "";
        const controls = block.attributes.controls === false ? "" : " controls";
        blockLines.push(`<Audio src="${src}"${controls}${autoplay} />`);
        break;
      }
      case "file": {
        const src = block.attributes.src ?? "";
        const filename = block.attributes.filename ?? "file";
        blockLines.push(`<File src="${src}" name="${filename}" />`);
        break;
      }
      case "bookmark": {
        const url = block.attributes.url ?? "";
        const title = block.attributes.title ?? "";
        blockLines.push(
          `<Bookmark url="${url}" title="${title}">${block.content}</Bookmark>`,
        );
        break;
      }
      case "html": {
        blockLines.push("<Html>");
        blockLines.push(block.content);
        blockLines.push("</Html>");
        break;
      }
      case "table": {
        blockLines.push("<Table>");
        blockLines.push(block.content);
        blockLines.push("</Table>");
        break;
      }
      case "tableOfContents": {
        blockLines.push("<TableOfContents />");
        break;
      }
      case "gallery": {
        blockLines.push("<Gallery>");
        blockLines.push(block.content);
        blockLines.push("</Gallery>");
        break;
      }
      case "board": {
        blockLines.push("<Board>");
        blockLines.push(block.content);
        blockLines.push("</Board>");
        break;
      }
      case "calendar": {
        blockLines.push("<Calendar>");
        blockLines.push(block.content);
        blockLines.push("</Calendar>");
        break;
      }
      default: {
        blockLines.push(block.content);
        break;
      }
    }

    // ブロック内部は単一改行で結合
    chunks.push(blockLines.join("\n"));
  });

  // ブロック間は空行で区切る
  return chunks.join("\n\n").trim();
}

export function createEmptyBlock(type: BlockType): Block {
  const block: Block = {
    id: nanoid(8),
    type,
    content: "",
    attributes: {},
  };

  switch (type) {
    case "heading":
      block.attributes.level = 2;
      break;
    case "list":
      block.attributes.ordered = false;
      block.attributes.items = [
        {
          id: nanoid(6),
          content: "",
        } satisfies ListItem,
      ];
      break;
    case "callout":
      block.attributes.type = "info";
      block.attributes.icon = DEFAULT_ICON;
      break;
    case "spacer":
      block.attributes.height = 24;
      break;
    case "image":
      block.attributes.src = "";
      block.attributes.alt = "";
      break;
    case "video":
      block.attributes.src = "";
      block.attributes.controls = true;
      block.attributes.autoplay = false;
      break;
    case "audio":
      block.attributes.src = "";
      block.attributes.controls = true;
      break;
    case "file":
      block.attributes.src = "";
      block.attributes.filename = "";
      break;
    case "bookmark":
      block.attributes.url = "";
      block.attributes.title = "";
      break;

    case "code":
      block.attributes.language = "plaintext";
      break;
    case "toggle":
      block.attributes.summary = "Details";
      break;
    default:
      break;
  }

  return block;
}
