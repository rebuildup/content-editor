/**
 * コンテンツ型定義（簡易版）
 * editor-homeのコンテンツ一覧取得用
 */

export interface ContentIndexItem {
    id: string;
    title: string;
    summary?: string;
    lang?: string;
    status?: string;
    visibility?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    tags?: string[];
}

