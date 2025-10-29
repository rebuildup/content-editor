export interface MediaItem {
  id: string;
  contentId?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  data?: Buffer;
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
