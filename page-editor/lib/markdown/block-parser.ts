import {
  convertBlocksToMarkdown,
  convertMarkdownToBlocks,
} from "@/lib/conversion";
import type { Block } from "@/types/blocks";

export function parseBlocks(markdown: string): Block[] {
  return convertMarkdownToBlocks(markdown);
}

export function stringifyBlocks(value: Block[]): string {
  return convertBlocksToMarkdown(value);
}
