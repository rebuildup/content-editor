/**
 * Markdownページのデータベースマッパー
 */

import type Database from "better-sqlite3";
import type {
  MarkdownFile,
  MarkdownFrontmatter,
  MarkdownPage,
  MarkdownStats,
} from "@/types/markdown";

// ========== データベース行型 ==========
export interface MarkdownPageRow {
  id: string;
  content_id: string | null;
  slug: string;
  frontmatter: string; // JSON
  body: string;
  html_cache: string | null;
  path: string | null;
  lang: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ========== Frontmatterパース ==========
/**
 * Frontmatterをパースする（YAML風の簡易版）
 */
export function parseFrontmatter(markdown: string): {
  frontmatter: MarkdownFrontmatter;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  const [, frontmatterStr, body] = match;
  const frontmatter: MarkdownFrontmatter = {};

  // 簡易的なYAMLパース（基本的なkey: value形式のみ）
  const lines = frontmatterStr.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: string | number | boolean | string[] = line
      .substring(colonIndex + 1)
      .trim();

    // 配列の処理（例: tags: [tag1, tag2]）
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/['"]/g, ""));
    }
    // 真偽値の処理
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    // 数値の処理
    else if (!Number.isNaN(Number(value))) value = Number(value);
    // 引用符の削除
    else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body: body.trim() };
}

/**
 * FrontmatterとBodyを結合してMarkdownファイル形式にする
 */
export function stringifyFrontmatter(
  frontmatter: MarkdownFrontmatter,
  body: string,
): string {
  const lines = ["---"];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => JSON.stringify(v)).join(", ")}]`);
    } else if (typeof value === "string") {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---", "", body);
  return lines.join("\n");
}

// ========== Markdown統計計算 ==========
export function calculateMarkdownStats(body: string): MarkdownStats {
  const lines = body.split("\n");
  const characterCount = body.length;
  const lineCount = lines.length;

  // 単語数（日本語対応）
  const words =
    body.match(/[\w\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]+/g) || [];
  const wordCount = words.length;

  // 見出し数
  const headings = body.match(/^#{1,6}\s/gm) || [];
  const headingCount = headings.length;

  // リンク数
  const links = body.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const linkCount = links.length;

  // 画像数
  const images = body.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  const imageCount = images.length;

  // 読了時間（日本語: 400-600文字/分、英語: 200-250単語/分）
  const readingTime = Math.ceil(characterCount / 500);

  return {
    characterCount,
    wordCount,
    lineCount,
    headingCount,
    linkCount,
    imageCount,
    readingTime,
  };
}

// ========== MarkdownPage型 → データベース行 ==========
export function markdownPageToRow(
  page: Partial<MarkdownPage>,
): Partial<MarkdownPageRow> {
  return {
    id: page.id,
    content_id: page.contentId || null,
    slug: page.slug,
    frontmatter: page.frontmatter ? JSON.stringify(page.frontmatter) : "{}",
    body: page.body || "",
    html_cache: page.htmlCache || null,
    path: page.path || null,
    lang: page.lang || "ja",
    status: page.status || "draft",
    version: page.version || 1,
    created_at: page.createdAt || new Date().toISOString(),
    updated_at: page.updatedAt || new Date().toISOString(),
    published_at: page.publishedAt || null,
  };
}

// ========== データベース行 → MarkdownPage型 ==========
export function rowToMarkdownPage(row: MarkdownPageRow): MarkdownPage {
  return {
    id: row.id,
    contentId: row.content_id || undefined,
    slug: row.slug,
    frontmatter: JSON.parse(row.frontmatter),
    body: row.body,
    htmlCache: row.html_cache || undefined,
    path: row.path || undefined,
    lang: row.lang || undefined,
    status: row.status as "draft" | "published" | "archived",
    version: row.version || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || undefined,
  };
}

// ========== Markdownページ取得 ==========
export function getMarkdownPage(
  db: Database.Database,
  idOrSlug: string,
): MarkdownPage | null {
  // IDまたはスラッグで検索
  let row = db
    .prepare("SELECT * FROM markdown_pages WHERE id = ?")
    .get(idOrSlug) as MarkdownPageRow | undefined;

  if (!row) {
    row = db
      .prepare("SELECT * FROM markdown_pages WHERE slug = ?")
      .get(idOrSlug) as MarkdownPageRow | undefined;
  }

  if (!row) return null;

  return rowToMarkdownPage(row);
}

// ========== Markdownページ保存 ==========
export function saveMarkdownPage(
  db: Database.Database,
  page: Partial<MarkdownPage>,
): void {
  const row = markdownPageToRow(page);

  const fields = Object.keys(row).filter(
    (k) => row[k as keyof typeof row] !== undefined,
  );
  const placeholders = fields.map((f) => `@${f}`).join(", ");
  const columns = fields.join(", ");

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO markdown_pages (${columns})
    VALUES (${placeholders})
  `);

  stmt.run(row);
}

// ========== Markdownページ削除 ==========
export function deleteMarkdownPage(
  db: Database.Database,
  idOrSlug: string,
): boolean {
  const result = db
    .prepare("DELETE FROM markdown_pages WHERE id = ? OR slug = ?")
    .run(idOrSlug, idOrSlug);
  return result.changes > 0;
}

// ========== Markdownファイルからインポート ==========
export function importMarkdownFile(file: MarkdownFile): MarkdownPage {
  const { frontmatter, body } = file.parsed || parseFrontmatter(file.content);

  const slug =
    frontmatter.slug ||
    file.filename
      .replace(/\.md$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const now = new Date().toISOString();

  return {
    id: `md_${Date.now()}`,
    slug,
    frontmatter,
    body,
    status: frontmatter.draft ? "draft" : "published",
    createdAt: frontmatter.date || now,
    updatedAt: frontmatter.updated || now,
    publishedAt: frontmatter.date,
  };
}

// ========== Markdownページをファイル形式でエクスポート ==========
export function exportMarkdownFile(page: MarkdownPage): MarkdownFile {
  const content = stringifyFrontmatter(page.frontmatter, page.body);

  return {
    filename: `${page.slug}.md`,
    content,
    parsed: {
      frontmatter: page.frontmatter,
      body: page.body,
    },
  };
}
