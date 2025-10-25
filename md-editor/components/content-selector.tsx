"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentIndexItem } from "@/types/content";

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

  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading contents from API...");

      // 直接fetchを使用してAPIをテスト
      const response = await fetch("http://localhost:3000/api/contents");
      console.log("Direct fetch response:", response);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Contents loaded:", data);
      setContents(data);
    } catch (err) {
      console.error("Failed to load contents:", err);
      setError(
        `コンテンツの読み込みに失敗しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

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
          backgroundColor: "#1f1f1f",
          border: "1px solid #dc2626",
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
          padding: "12px 16px",
          fontSize: "14px",
          border: "2px solid #333333",
          borderRadius: "8px",
          backgroundColor: "#111111",
          color: "#ffffff",
          cursor: "pointer",
          transition: "border-color 0.2s, background-color 0.2s",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#666666";
          e.target.style.backgroundColor = "#222222";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#333333";
          e.target.style.backgroundColor = "#111111";
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
        <p style={{ marginTop: "8px", fontSize: "12px", color: "#cccccc" }}>
          選択中: {contents.find((c) => c.id === selectedContentId)?.title}
        </p>
      )}
    </div>
  );
}
