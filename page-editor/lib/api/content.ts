import type { ContentIndexItem } from "@/types/content";
import { apiRequest } from "./client";

export async function fetchContentList(): Promise<ContentIndexItem[]> {
  return apiRequest<ContentIndexItem[]>("/api/contents");
}

export async function fetchContent(
  id: string,
): Promise<ContentIndexItem | null> {
  return apiRequest<ContentIndexItem | null>("/api/contents", {
    query: { id },
  });
}
