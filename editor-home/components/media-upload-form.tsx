"use client";

import Image from "next/image";
import { useState } from "react";

interface MediaUploadFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  contentId?: string;
}

export function MediaUploadForm({
  onSubmit,
  onCancel,
  isLoading = false,
  contentId,
}: MediaUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedContentId, setSelectedContentId] = useState(contentId || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // プレビュー画像の生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("ファイルを選択してください");
      return;
    }

    if (!selectedContentId) {
      alert("コンテンツIDを入力してください");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentId", selectedContentId);
    if (alt) formData.append("alt", alt);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);

    onSubmit(formData);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="contentId" className="form-label">
            コンテンツID <span style={{ color: "red" }}>*</span>
          </label>
          <input
            id="contentId"
            type="text"
            className="form-input"
            value={selectedContentId}
            onChange={(e) => setSelectedContentId(e.target.value)}
            placeholder="apple01"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            このメディアを関連付けるコンテンツのID
          </p>
        </div>

        <hr />

        <div className="form-group">
          <label htmlFor="file" className="form-label">
            ファイル <span style={{ color: "red" }}>*</span>
          </label>
          <div
            className="d-flex"
            style={{ gap: "0.5rem", alignItems: "center" }}
          >
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="form-input"
              style={{ flex: 1 }}
            />
            {file && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearFile}
                disabled={isLoading}
                style={{ padding: "0.5rem" }}
              >
                ×
              </button>
            )}
          </div>
          {file && (
            <p className="text-xs text-gray-500">
              選択済み: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {previewUrl && (
          <div className="form-group">
            <label htmlFor="preview" className="form-label">
              プレビュー
            </label>
            <div
              style={{
                border: "1px solid #e9ecef",
                borderRadius: "0.5rem",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Image
                src={previewUrl}
                alt="Preview"
                width={400}
                height={256}
                style={{
                  maxWidth: "100%",
                  maxHeight: "16rem",
                  margin: "0 auto",
                  borderRadius: "0.25rem",
                  display: "block",
                }}
              />
            </div>
          </div>
        )}

        <hr />

        <div className="form-group">
          <label htmlFor="alt" className="form-label">
            代替テキスト（Alt）
          </label>
          <input
            id="alt"
            type="text"
            className="form-input"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="画像の説明"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            アクセシビリティのための画像説明
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            説明
          </label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="メディアの詳細な説明"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            タグ（カンマ区切り）
          </label>
          <input
            id="tags"
            type="text"
            className="form-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            disabled={isLoading}
          />
        </div>
      </div>

      <hr />

      <div className="d-flex justify-content-end" style={{ gap: "0.5rem" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </button>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "アップロード中..." : "アップロード"}
        </button>
      </div>
    </form>
  );
}
