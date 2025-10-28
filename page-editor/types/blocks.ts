export type BlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "quote"
  | "callout"
  | "divider"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "bookmark"
  | "code"
  | "math"
  | "toggle"
  | "table"
  | "tableOfContents"
  | "gallery"
  | "board"
  | "calendar"
  | "embed"
  | "spacer";

export interface BlockAttributes {
  [key: string]: unknown;
}

export interface Block {
  id: string;
  type: BlockType;
  /**
   * Primary textual payload for the block.
   * Blocks that store structured data can keep this empty
   * and use attributes/children instead.
   */
  content: string;
  attributes: BlockAttributes;
  children?: Block[];
}

export interface ListItem {
  id: string;
  content: string;
  checked?: boolean;
  children?: ListItem[];
}

export interface BlockDraft extends Partial<Block> {
  type: BlockType;
}
