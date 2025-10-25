/**
 * Markdownページデータ型定義
 * editor-homeのデータ構造に対応
 */

export type ISODate = string;

/**
 * Markdown Frontmatter（メタデータ）
 */
export interface MarkdownFrontmatter {
  /** タイトル */
  title?: string;
  /** 説明 */
  description?: string;
  /** 著者 */
  author?: string;
  /** タグ */
  tags?: string[];
  /** カテゴリ */
  category?: string;
  /** 公開日 */
  date?: ISODate;
  /** 更新日 */
  updated?: ISODate;
  /** ドラフトフラグ */
  draft?: boolean;
  /** スラッグ（URL用） */
  slug?: string;
  /** カバー画像 */
  coverImage?: string;
  /** 目次を表示するか */
  toc?: boolean;
  /** カスタムフィールド */
  [key: string]: unknown;
}

/**
 * Markdownページ
 */
export interface MarkdownPage {
  /** ID */
  id: string;

  /** Content ID（関連するコンテンツ） */
  contentId?: string;

  /** スラッグ（URL識別子） */
  slug: string;

  /** Frontmatter（メタデータ） */
  frontmatter: MarkdownFrontmatter;

  /** Markdown本文 */
  body: string;

  /** HTMLキャッシュ */
  htmlCache?: string;

  /** パス（階層構造用） */
  path?: string;

  /** 言語 */
  lang?: string;

  /** 状態 */
  status?: "draft" | "published" | "archived";

  /** バージョン */
  version?: number;

  /** 作成日時 */
  createdAt: ISODate;

  /** 更新日時 */
  updatedAt: ISODate;

  /** 最終公開日時 */
  publishedAt?: ISODate;
}

/**
 * Markdownファイルのインポート/エクスポート用
 */
export interface MarkdownFile {
  /** ファイル名 */
  filename: string;
  /** 完全なMarkdownコンテンツ（frontmatter + body） */
  content: string;
  /** パース結果 */
  parsed?: {
    frontmatter: MarkdownFrontmatter;
    body: string;
  };
}
