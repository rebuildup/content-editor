import type { Block, BlockType, ListItem } from "@/types/blocks";
import { blockRegistry } from "./registry";

const TEXT_LIMIT = 120;

export function getBlockLabel(type: BlockType): string {
  return blockRegistry.get(type)?.label ?? type;
}

export function summarizeBlock(block: Block): string {
  switch (block.type) {
    case "heading":
      return summarizeHeading(block);
    case "list":
      return summarizeList(block);
    case "image":
      return summarizeImage(block);
    case "video":
    case "audio":
    case "embed":
    case "bookmark":
      return summarizeMedia(block);
    case "file":
      return summarizeFile(block);
    case "callout":
      return summarizeCallout(block);
    case "toggle":
      return summarizeToggle(block);
    default:
      return truncateText(toText(block.content));
  }
}

function summarizeHeading(block: Block): string {
  const level = Number(block.attributes.level ?? 1);
  const prefix = "#".repeat(Math.min(Math.max(level, 1), 6));
  return `${prefix} ${truncateText(toText(block.content), 80)}`.trim();
}

function summarizeList(block: Block): string {
  const items = Array.isArray(block.attributes.items)
    ? (block.attributes.items as ListItem[])
    : [];
  const firstItem = items[0];
  return truncateText(firstItem?.content ?? toText(block.content));
}

function summarizeImage(block: Block): string {
  const alt = toText((block.attributes.alt as string | undefined) ?? "");
  if (alt) {
    return truncateText(alt);
  }
  const caption = toText(block.content);
  if (caption) {
    return truncateText(caption);
  }
  const src = toText((block.attributes.src as string | undefined) ?? "");
  return src ? truncateText(src, 100) : "";
}

function summarizeMedia(block: Block): string {
  const title = toText((block.attributes.title as string | undefined) ?? "");
  if (title) {
    return truncateText(title);
  }
  const content = toText(block.content);
  if (content) {
    return truncateText(content);
  }
  const url =
    toText((block.attributes.url as string | undefined) ?? "") ||
    toText((block.attributes.src as string | undefined) ?? "");
  return truncateText(url, 100);
}

function summarizeFile(block: Block): string {
  const name = toText((block.attributes.filename as string | undefined) ?? "");
  if (name) {
    return truncateText(name);
  }
  return summarizeMedia(block);
}

function summarizeCallout(block: Block): string {
  const content = truncateText(toText(block.content));
  if (content) {
    return content;
  }
  const type = toText((block.attributes.type as string | undefined) ?? "");
  return type ? `Callout (${type})` : "Callout";
}

function summarizeToggle(block: Block): string {
  const summary = toText(
    (block.attributes.summary as string | undefined) ?? "",
  );
  if (summary) {
    return truncateText(summary);
  }
  return truncateText(toText(block.content));
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function truncateText(text: string, limit = TEXT_LIMIT): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit - 3).trimEnd()}...`;
}
