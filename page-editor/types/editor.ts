import type { Block, BlockType } from "./blocks";
import type { MarkdownPage } from "./markdown";
import type { MediaItem } from "./media";

export interface EditorSelection {
  blockId?: string;
  inlineOffset?: number;
}

export interface AutosaveStatus {
  isSaving: boolean;
  lastSavedAt?: Date | null;
  error?: string | null;
  hasUnsavedChanges: boolean;
}

export interface EditorContextValue {
  editorId: string;
  blocks: Block[];
  markdown: string;
  page: MarkdownPage | null;
  media: MediaItem[];
  selection: EditorSelection | null;
  autosave: AutosaveStatus;
}

export type EditorCommand =
  | "toggle-bold"
  | "toggle-italic"
  | "toggle-underline"
  | "toggle-strike"
  | "toggle-code"
  | "insert-paragraph"
  | "insert-heading"
  | "insert-list"
  | "insert-quote"
  | "insert-divider"
  | "insert-callout"
  | "insert-image"
  | "insert-video"
  | "insert-audio"
  | "insert-file"
  | "insert-embed"
  | "insert-table"
  | "insert-code"
  | "insert-math"
  | "insert-toggle"
  | "insert-bookmark";

export type InsertCommand =
  | "insert-paragraph"
  | "insert-heading"
  | "insert-list"
  | "insert-quote"
  | "insert-divider"
  | "insert-callout"
  | "insert-image"
  | "insert-video"
  | "insert-audio"
  | "insert-file"
  | "insert-embed"
  | "insert-table"
  | "insert-code"
  | "insert-math"
  | "insert-toggle"
  | "insert-bookmark"
  | "insert-spacer"
  | "insert-tableOfContents"
  | "insert-gallery"
  | "insert-board"
  | "insert-calendar";

export type BlockInsertMap = Record<InsertCommand, BlockType>;
