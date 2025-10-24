/**
 * データベース管理の型定義
 */

export interface DatabaseInfo {
    /** データベースID（ファイル名） */
    id: string;
    /** 表示名 */
    name: string;
    /** 説明 */
    description?: string;
    /** 作成日時 */
    createdAt: string;
    /** 更新日時 */
    updatedAt: string;
    /** ファイルサイズ（バイト） */
    size: number;
    /** アクティブかどうか */
    isActive: boolean;
}

export interface DatabaseStats {
    /** データベースID */
    id: string;
    /** コンテンツ数 */
    contentsCount: number;
    /** Markdownページ数 */
    markdownPagesCount: number;
    /** タグ数 */
    tagsCount: number;
    /** ファイルサイズ */
    fileSize: number;
}

