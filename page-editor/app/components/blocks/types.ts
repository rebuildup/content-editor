import type { Block, BlockAttributes, ListItem } from "@/types/blocks";

export interface BlockComponentProps {
  block: Block;
  readOnly?: boolean;
  onContentChange: (content: string) => void;
  onAttributesChange: (attributes: Partial<BlockAttributes>) => void;
  onItemsChange?: (items: ListItem[]) => void;
}
