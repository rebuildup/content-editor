import { nanoid } from "nanoid";
import type { Block, BlockType, ListItem } from "@/types/blocks";

const RAW_HTML_TAGS = new Set([
  "iframe",
  "marquee",
  "div",
  "section",
  "article",
  "aside",
  "figure",
  "figcaption",
  "canvas",
  "svg",
  "video",
  "audio",
  "embed",
  "object",
  "blockquote",
  "style",
  "script",
]);

function createBlock(type: BlockType, overrides?: Partial<Block>): Block {
  return {
    id: nanoid(8),
    type,
    content: "",
    attributes: {},
    ...overrides,
  };
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w+)=["{]([^"}]+)["}]/g;
  let match: RegExpExecArray | null = regex.exec(tag);
  while (match) {
    attributes[match[1]] = match[2];
    match = regex.exec(tag);
  }
  return attributes;
}

function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean,
): { block: Block; nextIndex: number } {
  const items: ListItem[] = [];
  let index = startIndex;
  const pattern = ordered ? /^\d+\.\s+/ : /^-\s+/;

  while (index < lines.length && pattern.test(lines[index])) {
    const raw = lines[index];
    const content = raw.replace(pattern, "");
    items.push({
      id: nanoid(6),
      content,
    });
    index++;
  }

  const block = createBlock("list", {
    attributes: { ordered, items },
  });
  return { block, nextIndex: index };
}

export function convertMarkdownToBlocks(markdown: string): Block[] {
  if (!markdown.trim()) {
    return [
      createBlock("paragraph", {
        content: "",
      }),
    ];
  }

  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      const match = line.match(/^(#+)\s(.*)$/);
      if (match) {
        const level = match[1].length;
        const content = match[2];
        blocks.push(
          createBlock("heading", {
            content,
            attributes: { level },
          }),
        );
      }
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        createBlock("quote", {
          content: quoteLines.join("\n"),
        }),
      );
      continue;
    }

    if (/^---$/.test(line.trim())) {
      blocks.push(createBlock("divider"));
      i++;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const language = line.replace(/```/, "").trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push(
        createBlock("code", {
          content: codeLines.join("\n"),
          attributes: { language },
        }),
      );
      i++; // skip closing ```
      continue;
    }

    if (line.startsWith("<Callout")) {
      const attributes = parseAttributes(line);
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("</Callout")) {
        contentLines.push(lines[i]);
        i++;
      }
      blocks.push(
        createBlock("callout", {
          content: contentLines.join("\n"),
          attributes,
        }),
      );
      i++; // skip closing tag
      continue;
    }

    if (line.startsWith("<Math")) {
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("</Math")) {
        contentLines.push(lines[i]);
        i++;
      }
      blocks.push(
        createBlock("math", {
          content: contentLines.join("\n"),
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Toggle")) {
      const attributes = parseAttributes(line);
      const childLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("</Toggle")) {
        childLines.push(lines[i]);
        i++;
      }
      blocks.push(
        createBlock("toggle", {
          attributes,
          children: convertMarkdownToBlocks(childLines.join("\n")),
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Image")) {
      const attributes = parseAttributes(line);
      const captionMatch = line.match(/>(.*)<\/Image>/);
      const caption = captionMatch ? captionMatch[1] : "";
      blocks.push(
        createBlock("image", {
          content: caption,
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Video")) {
      const attributes = parseAttributes(line);
      const contentMatch = line.match(/>(.*)<\/Video>/);
      blocks.push(
        createBlock("video", {
          content: contentMatch ? contentMatch[1] : "",
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Audio")) {
      const attributes = parseAttributes(line);
      blocks.push(
        createBlock("audio", {
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<File")) {
      const attributes = parseAttributes(line);
      blocks.push(
        createBlock("file", {
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Bookmark")) {
      const attributes = parseAttributes(line);
      const contentMatch = line.match(/>(.*)<\/Bookmark>/);
      blocks.push(
        createBlock("bookmark", {
          content: contentMatch ? contentMatch[1] : "",
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Embed")) {
      const attributes = parseAttributes(line);
      const contentMatch = line.match(/>(.*)<\/Embed>/);
      blocks.push(
        createBlock("embed", {
          content: contentMatch ? contentMatch[1] : "",
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith("<Html")) {
      const inlineMatch = line.match(/^<Html>(.*)<\/Html>$/);
      if (inlineMatch) {
        blocks.push(
          createBlock("html", {
            content: inlineMatch[1],
          }),
        );
        i++;
        continue;
      }

      const htmlLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("</Html>")) {
        htmlLines.push(lines[i]);
        i++;
      }
      blocks.push(
        createBlock("html", {
          content: htmlLines.join("\n"),
        }),
      );
      if (i < lines.length) {
        i++; // skip closing </Html>
      }
      continue;
    }

    if (line.startsWith("<Spacer")) {
      const attributes = parseAttributes(line);
      blocks.push(
        createBlock("spacer", {
          attributes,
        }),
      );
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const { block, nextIndex } = parseList(lines, i, true);
      blocks.push(block);
      i = nextIndex;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const { block, nextIndex } = parseList(lines, i, false);
      blocks.push(block);
      i = nextIndex;
      continue;
    }

    // default: accumulate consecutive non-empty lines into paragraph
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      paragraphLines.push(lines[i]);
      i++;
    }
    const paragraphText = paragraphLines.join("\n");
    if (looksLikeRawHtml(paragraphText)) {
      blocks.push(
        createBlock("html", {
          content: paragraphText,
        }),
      );
    } else {
      blocks.push(
        createBlock("paragraph", {
          content: paragraphText,
        }),
      );
    }
  }

  return blocks;
}

function looksLikeRawHtml(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.startsWith("<") || /^<Html/i.test(trimmed)) {
    return false;
  }

  const match = trimmed.match(/^<([a-zA-Z0-9:-]+)\b/);
  if (!match) {
    return false;
  }

  const tag = match[1]?.toLowerCase();
  if (!tag || !RAW_HTML_TAGS.has(tag)) {
    return false;
  }

  return true;
}
