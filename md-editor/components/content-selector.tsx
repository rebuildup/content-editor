"use client";

import type { ContentIndexItem } from "@/types/content";
import { fetchContentList } from "@/lib/api-client";
import { useEffect, useState } from "react";

interface ContentSelectorProps {
  selectedContentId?: string;
  onSelect: (contentId: string) => void;
}

export function ContentSelector({
  selectedContentId,
  onSelect,
}: ContentSelectorProps) {
  const [contents, setContents] = useState<ContentIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await fetchContentList();
      setContents(data);
    } catch (err) {
      setError("コンテンツの読み込みに失敗しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "16px", textAlign: "center" }}>読み込み中...</div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "16px",
          color: "#dc2626",
          backgroundColor: "#fef2f2",
          borderRadius: "8px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        htmlFor="content-select"
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        コンテンツを選択
      </label>
      <select
        id="content-select"
        value={selectedContentId || ""}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          fontSize: "14px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        <option value="">-- コンテンツを選択してください --</option>
        {contents.map((content) => (
          <option key={content.id} value={content.id}>
            {content.title} ({content.id})
          </option>
        ))}
      </select>
      {selectedContentId && (
        <p style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
          選択中: {contents.find((c) => c.id === selectedContentId)?.title}
        </p>
      )}
    </div>
  );
}

