/**
 * メディア（画像）の型定義
 */

export interface MediaItem {
  /** メディアID */
  id: string;
  /** コンテンツID（紐付け先） */
  contentId?: string;
  /** ファイル名 */
  filename: string;
  /** MIMEタイプ */
  mimeType: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** 幅（ピクセル） */
  width?: number;
  /** 高さ（ピクセル） */
  height?: number;
  /** 代替テキスト */
  alt?: string;
  /** 説明 */
  description?: string;
  /** タグ */
  tags?: string[];
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** バイナリデータ（取得時のみ） */
  data?: Buffer;
  /** Base64エンコード文字列（フロントエンド用） */
  base64?: string;
}

export interface MediaUploadRequest {
  contentId: string;
  filename: string;
  mimeType: string;
  base64Data: string;
  alt?: string;
  description?: string;
  tags?: string[];
}
