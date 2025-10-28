const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"];

export type MediaCategory = "image" | "video" | "audio" | "file";

export function detectMediaCategory(mimeType: string): MediaCategory {
  if (IMAGE_TYPES.includes(mimeType)) {
    return "image";
  }
  if (VIDEO_TYPES.includes(mimeType)) {
    return "video";
  }
  if (AUDIO_TYPES.includes(mimeType)) {
    return "audio";
  }
  return "file";
}

export async function readFileAsBase64(file: File): Promise<string> {
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

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes)) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
