import { nanoid } from "nanoid";
import { createEmptyBlock } from "@/lib/conversion";
import type { Block, BlockType, ListItem } from "@/types/blocks";

export function createInitialBlock(type: BlockType): Block {
  const block = createEmptyBlock(type);

  switch (type) {
    case "paragraph":
      block.content = "";
      break;
    case "heading":
      block.content = "New heading";
      break;
    case "list":
      block.attributes.items = [
        {
          id: nanoid(6),
          content: "List item",
        } satisfies ListItem,
      ];
      block.attributes.ordered = false;
      break;
    case "callout":
      block.content = "Callout content";
      break;
    case "code":
      block.content = "console.log('Hello');";
      break;
    case "math":
      block.content = "E = mc^2";
      break;
    case "toggle":
      block.content = "Add more details here";
      break;
    case "html":
      block.content = "";
      break;
    default:
      break;
  }

  return block;
}
