import type { BlockDefinition } from "@/lib/blocks/registry";
import { getBlockDefinitions } from "@/lib/blocks/registry";
import type { EditorCommand } from "@/types/editor";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  group: "format" | "insert" | "media" | "navigation";
  keywords?: string[];
}

const MARK_COMMANDS: CommandItem[] = [
  {
    id: "toggle-bold",
    label: "Bold",
    group: "format",
    keywords: ["strong", "bold"],
  },
  {
    id: "toggle-italic",
    label: "Italic",
    group: "format",
    keywords: ["emphasis", "italic"],
  },
  {
    id: "toggle-underline",
    label: "Underline",
    group: "format",
    keywords: ["underline"],
  },
  {
    id: "toggle-strike",
    label: "Strikethrough",
    group: "format",
    keywords: ["strike", "strikethrough"],
  },
  {
    id: "toggle-code",
    label: "Inline code",
    group: "format",
    keywords: ["code", "inline"],
  },
];

function mapBlockToCommand(definition: BlockDefinition): CommandItem {
  return {
    id: `insert-${definition.type}`,
    label: definition.label,
    description: definition.description,
    group:
      definition.group === "media"
        ? "media"
        : definition.group === "embed"
          ? "media"
          : "insert",
    keywords: definition.keywords,
  };
}

export function getCommandPaletteItems(): CommandItem[] {
  const blockCommands = getBlockDefinitions().map(mapBlockToCommand);
  return [...MARK_COMMANDS, ...blockCommands];
}

export function isMarkCommand(command: string): command is EditorCommand {
  return MARK_COMMANDS.some((item) => item.id === command);
}
