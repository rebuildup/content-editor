/**
 * Content index and metadata types shared with editor-home.
 */

export interface ContentIndexItem {
  id: string;
  title: string;
  summary?: string;
  lang?: string;
  status?: "draft" | "published" | "archived";
  visibility?: "draft" | "internal" | "public";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  tags?: string[];
}

export interface ContentReference {
  id: string;
  title: string;
}
