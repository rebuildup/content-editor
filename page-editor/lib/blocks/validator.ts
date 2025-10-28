import type { Block } from "@/types/blocks";
import { blockRegistry } from "./registry";

export function isSupportedBlockType(type: string): boolean {
  return blockRegistry.has(type as never);
}

export function validateBlocks(blocks: Block[]): Block[] {
  return blocks.filter((block) => isSupportedBlock(block));
}

function isSupportedBlock(block: Block): boolean {
  if (!isSupportedBlockType(block.type)) {
    return false;
  }
  if (!block.id) {
    return false;
  }
  return true;
}
