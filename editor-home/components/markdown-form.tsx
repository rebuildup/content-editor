"use client";

import { useState } from "react";
import type { MarkdownPage } from "@/types/markdown";

interface MarkdownFormProps {
  initialData?: Partial<MarkdownPage>;
  onSubmit: (data: Partial<MarkdownPage>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function MarkdownForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: MarkdownFormProps) {
  const [formData, setFormData] = useState<Partial<MarkdownPage>>({
    id: initialData.id || "",
    slug: initialData.slug || "",
    body: initialData.body || "",
    lang: initialData.lang || "ja",
    status: initialData.status || "draft",
    contentId: initialData.contentId || "",
    path: initialData.path || "",
    frontmatter: initialData.frontmatter || {
      title: "",
      description: "",
      tags: [],
      author: "",
    },
    ...initialData,
  });

  const [activeTab, setActiveTab] = useState("content");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFrontmatter = (
    key: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData({
      ...formData,
      frontmatter: {
        ...formData.frontmatter,
        [key]: value,
      },
    });
  };

  const tabs = [
    { id: "content", label: "コンテンツ" },
    { id: "frontmatter", label: "フロントマター" },
    { id: "settings", label: "設定" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* コンテンツタブ */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {mode === "create" && (
            <div className="form-group">
              <label htmlFor="id" className="form-label">
                ページID <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="id"
                type="text"
                className="form-input"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                placeholder="my-page-001"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="slug" className="form-label">
              スラッグ <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="slug"
              type="text"
              className="form-input"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="my-page-slug"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              URL用のスラッグ（例: /blog/my-page-slug）
            </p>
          </div>

          <hr />

          <div className="form-group">
            <label htmlFor="body" className="form-label">
              Markdown本文 <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="body"
              className="form-textarea"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="# タイトル&#10;&#10;ここにMarkdown形式で本文を書きます..."
              rows={20}
              required
              disabled={isLoading}
              style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
            />
            <p className="text-xs text-gray-500">
              Markdown記法で記述してください
            </p>
          </div>
        </div>
      )}

      {/* フロントマタータブ */}
      {activeTab === "frontmatter" && (
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="fm-title" className="form-label">
              タイトル
            </label>
            <input
              id="fm-title"
              type="text"
              className="form-input"
              value={formData.frontmatter?.title || ""}
              onChange={(e) => updateFrontmatter("title", e.target.value)}
              placeholder="ページタイトル"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-description" className="form-label">
              説明
            </label>
            <textarea
              id="fm-description"
              className="form-textarea"
              value={formData.frontmatter?.description || ""}
              onChange={(e) => updateFrontmatter("description", e.target.value)}
              placeholder="ページの説明"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-author" className="form-label">
              著者
            </label>
            <input
              id="fm-author"
              type="text"
              className="form-input"
              value={formData.frontmatter?.author || ""}
              onChange={(e) => updateFrontmatter("author", e.target.value)}
              placeholder="著者名"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-tags" className="form-label">
              タグ（カンマ区切り）
            </label>
            <input
              id="fm-tags"
              type="text"
              className="form-input"
              value={formData.frontmatter?.tags?.join(", ") || ""}
              onChange={(e) =>
                updateFrontmatter(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder="tag1, tag2, tag3"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-date" className="form-label">
              日付
            </label>
            <input
              id="fm-date"
              type="date"
              className="form-input"
              value={
                formData.frontmatter?.date
                  ? new Date(formData.frontmatter.date)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) => updateFrontmatter("date", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-image" className="form-label">
              アイキャッチ画像URL
            </label>
            <input
              id="fm-image"
              type="text"
              className="form-input"
              value={String(formData.frontmatter?.image || "")}
              onChange={(e) => updateFrontmatter("image", e.target.value)}
              placeholder="/images/featured.jpg"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-custom" className="form-label">
              カスタムフィールド（JSON）
            </label>
            <textarea
              id="fm-custom"
              className="form-textarea"
              value={
                formData.frontmatter?.custom
                  ? JSON.stringify(formData.frontmatter.custom, null, 2)
                  : ""
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateFrontmatter("custom", parsed);
                } catch {
                  // Invalid JSON - ignore
                }
              }}
              placeholder='{"key": "value"}'
              rows={4}
              disabled={isLoading}
              style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
            />
          </div>
        </div>
      )}

      {/* 設定タブ */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="contentId" className="form-label">
              関連コンテンツID
            </label>
            <input
              id="contentId"
              type="text"
              className="form-input"
              value={formData.contentId || ""}
              onChange={(e) =>
                setFormData({ ...formData, contentId: e.target.value })
              }
              placeholder="content-id"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              このページに関連するコンテンツのID
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="path" className="form-label">
              パス
            </label>
            <input
              id="path"
              type="text"
              className="form-input"
              value={formData.path || ""}
              onChange={(e) =>
                setFormData({ ...formData, path: e.target.value })
              }
              placeholder="/blog/category"
              disabled={isLoading}
            />
          </div>

          <div className="row">
            <div className="col col-6">
              <div className="form-group">
                <label htmlFor="lang" className="form-label">
                  言語
                </label>
                <select
                  id="lang"
                  className="form-select"
                  value={formData.lang}
                  onChange={(e) =>
                    setFormData({ ...formData, lang: e.target.value })
                  }
                  disabled={isLoading}
                >
                  <option value="ja">日本語 (ja)</option>
                  <option value="en">English (en)</option>
                  <option value="zh">中文 (zh)</option>
                  <option value="ko">한국어 (ko)</option>
                </select>
              </div>
            </div>

            <div className="col col-6">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  ステータス
                </label>
                <select
                  id="status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "draft"
                        | "published"
                        | "archived",
                    })
                  }
                  disabled={isLoading}
                >
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                  <option value="archived">アーカイブ</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="version" className="form-label">
              バージョン
            </label>
            <input
              id="version"
              type="number"
              className="form-input"
              value={formData.version || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  version: parseInt(e.target.value, 10) || 1,
                })
              }
              min="1"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

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
          {isLoading ? "保存中..." : mode === "create" ? "作成" : "保存"}
        </button>
      </div>
    </form>
  );
}
