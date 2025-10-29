import type { MediaItem, MediaUploadRequest } from "@/types/media";
import { apiRequest, buildUrl } from "./client";

export async function fetchMediaList(contentId: string): Promise<MediaItem[]> {
  return apiRequest<MediaItem[]>("/api/media", {
    query: { contentId },
  });
}

export async function fetchMedia(
  contentId: string,
  id: string,
): Promise<MediaItem> {
  return apiRequest<MediaItem>("/api/media", {
    query: { contentId, id },
  });
}

export async function uploadMedia(
  payload: MediaUploadRequest,
): Promise<{ ok: boolean; id: string }> {
  return apiRequest<{ ok: boolean; id: string }>("/api/media", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteMedia(contentId: string, id: string) {
  return apiRequest<{ ok: boolean }>("/api/media", {
    method: "DELETE",
    query: { contentId, id },
  });
}

export async function uploadMediaFile(
  contentId: string,
  file: File,
  extras?: Pick<MediaUploadRequest, "alt" | "description" | "tags">,
) {
  const base64Data = await fileToBase64(file);
  return uploadMedia({
    contentId,
    filename: file.name,
    mimeType: file.type,
    base64Data,
    ...extras,
  });
}

export function getMediaUrl(contentId: string, id: string) {
  const encodedContentId = encodeURIComponent(contentId);
  const encodedId = encodeURIComponent(id);
  return buildUrl(`/api/media/${encodedContentId}/${encodedId}`);
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file as base64 string"));
        return;
      }
      const [, base64] = result.split(",");
      resolve(base64 ?? "");
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}
