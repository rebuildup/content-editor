import matter from "gray-matter";
import type { MarkdownFrontmatter } from "@/types/markdown";

export interface ParsedMarkdown {
  frontmatter: MarkdownFrontmatter;
  body: string;
}

export function parseMarkdown(markdown: string): ParsedMarkdown {
  const { data, content } = matter(markdown);
  return {
    frontmatter: (data ?? {}) as MarkdownFrontmatter,
    body: content ?? "",
  };
}

export function serializeMarkdown({
  frontmatter,
  body,
}: ParsedMarkdown): string {
  return matter.stringify(body, frontmatter ?? {});
}
