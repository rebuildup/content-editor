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
  const lines: string[] = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case "paragraph": {
        lines.push(escapeText(block.content));
        break;
      }
      case "heading": {
        const level = Number(block.attributes.level ?? 1);
        const prefix = "#".repeat(Math.min(Math.max(level, 1), 6));
        lines.push(`${prefix} ${escapeText(block.content)}`.trim());
        break;
      }
      case "quote": {
        const quoteLines = block.content
          .split(/\r?\n/)
          .map((line) => `> ${line}`.trimEnd());
        lines.push(...quoteLines);
        if (block.attributes.citation) {
          lines.push(`> — ${block.attributes.citation}`);
        }
        break;
      }
      case "callout": {
        const type = block.attributes.type ?? "info";
        const icon =
          (block.attributes.icon as string | undefined) ?? DEFAULT_ICON;
        lines.push(`<Callout type="${type}" icon="${icon}">`);
        lines.push(block.content);
        lines.push("</Callout>");
        break;
      }
      case "divider": {
        lines.push("---");
        break;
      }
      case "spacer": {
        const height = block.attributes.height ?? 24;
        lines.push(`<Spacer height="${height}" />`);
        break;
      }
      case "list": {
        const items = Array.isArray(block.attributes.items)
          ? (block.attributes.items as ListItem[])
          : [];
        const ordered = Boolean(block.attributes.ordered);
        lines.push(...formatList(items, ordered));
        break;
      }
      case "code": {
        const language =
          (block.attributes.language as string | undefined) ?? "";
        const fence = language ? `\`\`\`${language}` : "```";
        lines.push(fence);
        lines.push(block.content);
        lines.push("```");
        break;
      }
      case "math": {
        lines.push("<Math>");
        lines.push(block.content);
        lines.push("</Math>");
        break;
      }
      case "toggle": {
        const summary = block.attributes.summary ?? "Details";
        lines.push(`<Toggle summary="${summary}">`);
        if (block.children && block.children.length > 0) {
          lines.push(convertBlocksToMarkdown(block.children));
        } else {
          lines.push(block.content);
        }
        lines.push("</Toggle>");
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
        lines.push(
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
        lines.push(
          `<Video src="${src}"${poster}${controls}${autoplay}>${block.content}</Video>`,
        );
        break;
      }
      case "audio": {
        const src = block.attributes.src ?? "";
        const autoplay = block.attributes.autoplay ? " autoplay" : "";
        const controls = block.attributes.controls === false ? "" : " controls";
        lines.push(`<Audio src="${src}"${controls}${autoplay} />`);
        break;
      }
      case "file": {
        const src = block.attributes.src ?? "";
        const filename = block.attributes.filename ?? "file";
        lines.push(`<File src="${src}" name="${filename}" />`);
        break;
      }
      case "bookmark": {
        const url = block.attributes.url ?? "";
        const title = block.attributes.title ?? "";
        lines.push(
          `<Bookmark url="${url}" title="${title}">${block.content}</Bookmark>`,
        );
        break;
      }
      case "embed": {
        const url = block.attributes.url ?? "";
        const provider = block.attributes.provider
          ? ` provider="${block.attributes.provider}"`
          : "";
        lines.push(`<Embed url="${url}"${provider}>${block.content}</Embed>`);
        break;
      }
      case "html": {
        lines.push("<Html>");
        lines.push(block.content);
        lines.push("</Html>");
        break;
      }
      case "table": {
        lines.push("<Table>");
        lines.push(block.content);
        lines.push("</Table>");
        break;
      }
      case "tableOfContents": {
        lines.push("<TableOfContents />");
        break;
      }
      case "gallery": {
        lines.push("<Gallery>");
        lines.push(block.content);
        lines.push("</Gallery>");
        break;
      }
      case "board": {
        lines.push("<Board>");
        lines.push(block.content);
        lines.push("</Board>");
        break;
      }
      case "calendar": {
        lines.push("<Calendar>");
        lines.push(block.content);
        lines.push("</Calendar>");
        break;
      }
      default: {
        lines.push(block.content);
        break;
      }
    }
  });

  return lines.join("\n\n").trim();
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
    case "embed":
      block.attributes.url = "";
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
