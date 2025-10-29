import type { KeyboardEvent } from "react";
import type { Block, BlockAttributes, ListItem } from "@/types/blocks";

export interface BlockComponentProps {
  block: Block;
  readOnly?: boolean;
  onContentChange: (content: string) => void;
  onAttributesChange: (attributes: Partial<BlockAttributes>) => void;
  onItemsChange?: (items: ListItem[]) => void;
  autoFocus?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  contentId?: string;
}
