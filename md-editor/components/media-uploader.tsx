"use client";

import type { MediaItem } from "@/types/media";
import { fetchMediaList, uploadMedia } from "@/lib/api-client";
import { useEffect, useState } from "react";

interface MediaUploaderProps {
  contentId: string;
  onMediaInsert: (mediaUrl: string) => void;
}

export function MediaUploader({
  contentId,
  onMediaInsert,
}: MediaUploaderProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contentId && showGallery) {
      loadMediaList();
    }
  }, [contentId, showGallery]);

  const loadMediaList = async () => {
    try {
      const data = await fetchMediaList(contentId);
      setMediaList(data);
    } catch (err) {
      console.error("Failed to load media list:", err);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプチェック
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("画像または動画ファイルを選択してください");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // ファイルをBase64に変換
      const base64Data = await fileToBase64(file);

      // アップロード
      const result = await uploadMedia({
        contentId,
        filename: file.name,
        mimeType: file.type,
        base64Data,
        alt: file.name,
      });

      // メディア一覧を更新
      await loadMediaList();

      // メディアURLを作成（editor-homeのAPIエンドポイント）
      const mediaUrl = `http://localhost:3000/api/media?contentId=${contentId}&id=${result.id}`;

      // エディタに挿入
      onMediaInsert(mediaUrl);

      // 入力をリセット
      event.target.value = "";
    } catch (err) {
      setError("メディアのアップロードに失敗しました");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleMediaClick = (media: MediaItem) => {
    const mediaUrl = `http://localhost:3000/api/media?contentId=${contentId}&id=${media.id}`;
    onMediaInsert(mediaUrl);
  };

  return (
    <div
      style={{
        marginBottom: "24px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
          メディア管理
        </h3>
        <button
          type="button"
          onClick={() => setShowGallery(!showGallery)}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          {showGallery ? "ギャラリーを閉じる" : "ギャラリーを開く"}
        </button>
      </div>

      {!contentId && (
        <p style={{ color: "#dc2626", fontSize: "14px", margin: "8px 0" }}>
          メディアをアップロードするには、まずコンテンツを選択してください
        </p>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "12px",
            color: "#dc2626",
            backgroundColor: "#fef2f2",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "12px" }}>
        <label
          htmlFor="media-upload"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 500,
            color: "white",
            backgroundColor: contentId ? "#2563eb" : "#9ca3af",
            borderRadius: "6px",
            cursor: contentId ? "pointer" : "not-allowed",
            transition: "background-color 0.2s",
          }}
        >
          {uploading ? "アップロード中..." : "画像・動画をアップロード"}
        </label>
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={!contentId || uploading}
          style={{ display: "none" }}
        />
      </div>

      {showGallery && contentId && (
        <div>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            メディアギャラリー ({mediaList.length}件)
          </h4>
          {mediaList.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              メディアがありません
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "12px",
              }}
            >
              {mediaList.map((media) => (
                <button
                  type="button"
                  key={media.id}
                  onClick={() => handleMediaClick(media)}
                  style={{
                    padding: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "80px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {media.mimeType.startsWith("image/") ? (
                      <span style={{ fontSize: "32px" }}>🖼️</span>
                    ) : (
                      <span style={{ fontSize: "32px" }}>🎬</span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {media.filename}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatFileSize(media.size)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== ユーティリティ関数 ==========

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:image/png;base64," の部分を削除
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

