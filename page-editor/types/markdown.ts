export type ISODate = string;

export interface MarkdownFrontmatter {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  category?: string;
  date?: ISODate;
  updated?: ISODate;
  draft?: boolean;
  slug?: string;
  coverImage?: string;
  toc?: boolean;
  [key: string]: unknown;
}

export type MarkdownStatus = "draft" | "published" | "archived";

export interface MarkdownPage {
  id: string;
  contentId?: string;
  slug: string;
  frontmatter: MarkdownFrontmatter;
  body: string;
  htmlCache?: string;
  path?: string;
  lang?: string;
  status?: MarkdownStatus;
  version?: number;
  createdAt: ISODate;
  updatedAt: ISODate;
  publishedAt?: ISODate | null;
}

export interface MarkdownFile {
  filename: string;
  content: string;
  parsed?: {
    frontmatter: MarkdownFrontmatter;
    body: string;
  };
}
