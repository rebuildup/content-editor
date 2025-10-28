import type { EditorCommand } from "@/types/editor";

export interface Shortcut {
  keys: string[];
  command: EditorCommand;
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { keys: ["Mod+b"], command: "toggle-bold" },
  { keys: ["Mod+i"], command: "toggle-italic" },
  { keys: ["Mod+u"], command: "toggle-underline" },
  { keys: ["Mod+Shift+x"], command: "toggle-strike" },
  { keys: ["Mod+`"], command: "toggle-code" },
];

export function matchShortcut(
  event: KeyboardEvent,
  shortcut: Shortcut,
): boolean {
  const key = event.key.toLowerCase();
  return shortcut.keys.some((shortcutKey) => {
    const normalized = shortcutKey.toLowerCase();
    const parts = normalized.split("+");
    const modifiers = parts.slice(0, -1);
    const targetKey = parts.at(-1);

    const modMatch = modifiers.every((modifier) => {
      switch (modifier) {
        case "mod":
          return event.metaKey || event.ctrlKey;
        case "shift":
          return event.shiftKey;
        case "alt":
          return event.altKey;
        case "ctrl":
        case "control":
          return event.ctrlKey;
        case "meta":
          return event.metaKey;
        default:
          return false;
      }
    });

    return modMatch && key === (targetKey ?? "");
  });
}
