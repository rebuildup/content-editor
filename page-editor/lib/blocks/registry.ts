import type { BlockType } from "@/types/blocks";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description?: string;
  icon?: string;
  group: "basic" | "media" | "advanced" | "database" | "embed" | "layout";
  keywords?: string[];
  shortcut?: string;
}

const DEFINITIONS: BlockDefinition[] = [
  {
    type: "paragraph",
    label: "Paragraph",
    description: "Plain text block with rich inline formatting.",
    icon: "¶",
    group: "basic",
    keywords: ["text", "paragraph"],
  },
  {
    type: "heading",
    label: "Heading",
    description: "Section heading from H1 to H3.",
    icon: "H",
    group: "basic",
    keywords: ["title", "section"],
  },
  {
    type: "list",
    label: "List",
    description: "Bulleted, numbered, or to-do lists.",
    icon: "•",
    group: "basic",
    keywords: ["bullet", "numbered", "todo"],
  },
  {
    type: "quote",
    label: "Quote",
    description: "Pull quote with attribution.",
    icon: "❝",
    group: "basic",
    keywords: ["blockquote"],
  },
  {
    type: "callout",
    label: "Callout",
    description: "Highlight information with icon and tone.",
    icon: "⚡",
    group: "basic",
    keywords: ["info", "warning", "success"],
  },
  {
    type: "divider",
    label: "Divider",
    description: "Visual divider between sections.",
    icon: "—",
    group: "layout",
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Add vertical spacing with adjustable height.",
    icon: "⬍",
    group: "layout",
  },
  {
    type: "image",
    label: "Image",
    description: "Upload or select image from media library.",
    icon: "🖼",
    group: "media",
  },
  {
    type: "video",
    label: "Video",
    description: "Embed uploaded or external video.",
    icon: "▶",
    group: "media",
  },
  {
    type: "audio",
    label: "Audio",
    description: "Attach audio files with player controls.",
    icon: "♪",
    group: "media",
  },
  {
    type: "file",
    label: "File",
    description: "Upload documents available for download.",
    icon: "📄",
    group: "media",
  },
  {
    type: "bookmark",
    label: "Bookmark",
    description: "Show rich preview for external links.",
    icon: "🔖",
    group: "embed",
  },
  {
    type: "html",
    label: "Custom HTML",
    description: "Write raw HTML and preview it instantly.",
    icon: "</>",
    group: "advanced",
    keywords: ["html", "iframe", "embed", "custom"],
  },
  {
    type: "code",
    label: "Code",
    description: "Syntax highlighted code block.",
    icon: "</>",
    group: "advanced",
  },
  {
    type: "math",
    label: "Math",
    description: "Render LaTeX equations with KaTeX.",
    icon: "∑",
    group: "advanced",
  },
  {
    type: "toggle",
    label: "Toggle",
    description: "Collapsible section for FAQs or checklists.",
    icon: "▸",
    group: "advanced",
  },
  {
    type: "table",
    label: "Table",
    description: "Flexible table with rich text cells.",
    icon: "⌗",
    group: "database",
  },
  {
    type: "tableOfContents",
    label: "Table of Contents",
    description: "Auto-generated outline from headings.",
    icon: "☰",
    group: "advanced",
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Grid or carousel of media items.",
    icon: "▥",
    group: "media",
  },
  {
    type: "board",
    label: "Board",
    description: "Kanban-style board for tasks.",
    icon: "▤",
    group: "database",
  },
  {
    type: "calendar",
    label: "Calendar",
    description: "Timeline or calendar events overview.",
    icon: "📅",
    group: "database",
  },
];

export const blockRegistry = new Map<BlockType, BlockDefinition>(
  DEFINITIONS.map((definition) => [definition.type, definition]),
);

export function getBlockDefinitions(group?: BlockDefinition["group"]) {
  if (!group) {
    return DEFINITIONS;
  }
  return DEFINITIONS.filter((definition) => definition.group === group);
}

export function findBlockDefinition(type: BlockType) {
  return blockRegistry.get(type);
}

export function searchBlocks(keyword: string) {
  const term = keyword.toLowerCase().trim();
  if (!term) {
    return DEFINITIONS;
  }
  return DEFINITIONS.filter((definition) => {
    return (
      definition.label.toLowerCase().includes(term) ||
      definition.description?.toLowerCase().includes(term) ||
      definition.keywords?.some((k) => k.toLowerCase().includes(term))
    );
  });
}
