/**
 * editor-homeのAPIクライアント
 */

import type { ContentIndexItem } from "@/types/content";
import type { MarkdownPage } from "@/types/markdown";
import type { MediaItem, MediaUploadRequest } from "@/types/media";

// editor-homeのポートを設定
const EDITOR_HOME_URL =
    process.env.NEXT_PUBLIC_EDITOR_HOME_URL || "http://localhost:3000";

// ========== コンテンツAPI ==========

export async function fetchContentList(): Promise<ContentIndexItem[]> {
    const response = await fetch(`${EDITOR_HOME_URL}/api/contents`);
    if (!response.ok) {
        throw new Error("Failed to fetch content list");
    }
    return response.json();
}

export async function fetchContent(contentId: string): Promise<ContentIndexItem> {
    const response = await fetch(
        `${EDITOR_HOME_URL}/api/contents?id=${contentId}`,
    );
    if (!response.ok) {
        throw new Error("Failed to fetch content");
    }
    return response.json();
}

// ========== マークダウンAPI ==========

export async function fetchMarkdownPages(): Promise<MarkdownPage[]> {
    const response = await fetch(`${EDITOR_HOME_URL}/api/markdown`);
    if (!response.ok) {
        throw new Error("Failed to fetch markdown pages");
    }
    return response.json();
}

export async function fetchMarkdownPage(
    idOrSlug: string,
): Promise<MarkdownPage> {
    const response = await fetch(
        `${EDITOR_HOME_URL}/api/markdown?id=${idOrSlug}`,
    );
    if (!response.ok) {
        throw new Error("Failed to fetch markdown page");
    }
    return response.json();
}

export async function createMarkdownPage(
    data: Partial<MarkdownPage>,
): Promise<{ ok: boolean; id: string; slug: string }> {
    const response = await fetch(`${EDITOR_HOME_URL}/api/markdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create markdown page");
    }
    return response.json();
}

export async function updateMarkdownPage(
    data: Partial<MarkdownPage>,
): Promise<{ ok: boolean }> {
    const response = await fetch(`${EDITOR_HOME_URL}/api/markdown`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to update markdown page");
    }
    return response.json();
}

export async function deleteMarkdownPage(
    idOrSlug: string,
): Promise<{ ok: boolean }> {
    const response = await fetch(
        `${EDITOR_HOME_URL}/api/markdown?id=${idOrSlug}`,
        {
            method: "DELETE",
        },
    );
    if (!response.ok) {
        throw new Error("Failed to delete markdown page");
    }
    return response.json();
}

// ========== メディアAPI ==========

export async function fetchMediaList(contentId: string): Promise<MediaItem[]> {
    const response = await fetch(
        `${EDITOR_HOME_URL}/api/media?contentId=${contentId}`,
    );
    if (!response.ok) {
        throw new Error("Failed to fetch media list");
    }
    return response.json();
}

export async function fetchMedia(
    contentId: string,
    mediaId: string,
): Promise<MediaItem> {
    const response = await fetch(
        `${EDITOR_HOME_URL}/api/media?contentId=${contentId}&id=${mediaId}`,
    );
    if (!response.ok) {
        throw new Error("Failed to fetch media");
    }
    return response.json();
}

export async function uploadMedia(
    data: MediaUploadRequest,
): Promise<{ ok: boolean; id: string }> {
    const response = await fetch(`${EDITOR_HOME_URL}/api/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to upload media");
    }
    return response.json();
}

export async function deleteMedia(
    contentId: string,
    mediaId: string,
): Promise<{ ok: boolean }> {
    const response = await fetch(
        `${EDITOR_HOME_URL}/api/media?contentId=${contentId}&id=${mediaId}`,
        {
            method: "DELETE",
        },
    );
    if (!response.ok) {
        throw new Error("Failed to delete media");
    }
    return response.json();
}

