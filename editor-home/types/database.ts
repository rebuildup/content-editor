/**
 * データベース関連の型定義
 */

// ========== データベース行の型定義 ==========

export interface ContentIndexRow {
  id: string;
  db_file: string;
  title: string;
  summary: string;
  lang: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags?: string;
  thumbnails?: string;
  seo?: string;
}

export interface ContentAssetRow {
  id: number;
  content_id: string;
  src: string;
  type: string;
  width: number;
  height: number;
  alt: string;
  meta: string;
  order: number;
}

export interface ContentLinkRow {
  id: number;
  content_id: string;
  href: string;
  label: string;
  rel: string;
  is_primary: number;
  description: string;
  order: number;
}

export interface ContentRelationRow {
  id: number;
  source_id: string;
  target_id: string;
  type: string;
  bidirectional: number;
  weight: number;
  meta: string;
}

export interface ContentTagRow {
  tag: string;
}

export interface MediaRow {
  id: string;
  content_id: string;
  filename?: string;
  mime_type?: string;
  size?: number;
  src: string;
  type: string;
  width: number;
  height: number;
  alt: string;
  description?: string;
  tags?: string;
  data?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface DatabaseStats {
  id: string;
  contentsCount: number;
  markdownPagesCount: number;
  tagsCount: number;
  fileSize: number;
  lastUpdated: string;
}
