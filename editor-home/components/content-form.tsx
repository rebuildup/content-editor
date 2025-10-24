"use client";

import { useState } from "react";
import type { Content } from "@/types/content";

interface ContentFormProps {
  initialData?: Partial<Content>;
  onSubmit: (data: Partial<Content>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function ContentForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: ContentFormProps) {
  const [formData, setFormData] = useState<Partial<Content>>({
    id: initialData.id || "",
    title: initialData.title || "",
    summary: initialData.summary || "",
    lang: initialData.lang || "ja",
    status: initialData.status || "draft",
    visibility: initialData.visibility || "draft",
    tags: initialData.tags || [],
    publicUrl: initialData.publicUrl || "",
    parentId: initialData.parentId || "",
    path: initialData.path || "",
    depth: initialData.depth || 0,
    order: initialData.order || 0,
    seo: initialData.seo || undefined,
    searchable: initialData.searchable || undefined,
    i18n: initialData.i18n || undefined,
    permissions: initialData.permissions || undefined,
    ext: initialData.ext || undefined,
    ...initialData,
  });

  const [newTag, setNewTag] = useState("");
  const [seoFields, setSeoFields] = useState({
    metaTitle: formData.seo?.meta?.title || "",
    metaDescription: formData.seo?.meta?.description || "",
    ogTitle: formData.seo?.openGraph?.title || "",
    ogDescription: formData.seo?.openGraph?.description || "",
    ogImage: formData.seo?.openGraph?.image || "",
    canonical: formData.seo?.meta?.canonical || "",
  });
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seo =
      seoFields.metaTitle || seoFields.metaDescription || seoFields.canonical
        ? {
            meta: {
              title: seoFields.metaTitle || undefined,
              description: seoFields.metaDescription || undefined,
              canonical: seoFields.canonical || undefined,
            },
            openGraph: {
              title: seoFields.ogTitle || undefined,
              description: seoFields.ogDescription || undefined,
              image: seoFields.ogImage || undefined,
            },
          }
        : undefined;

    onSubmit({
      ...formData,
      seo: seo,
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  const tabs = [
    { id: "basic", label: "基本情報" },
    { id: "seo", label: "SEO" },
    { id: "structure", label: "構造" },
    { id: "i18n", label: "多言語" },
    { id: "advanced", label: "高度な設定" },
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

      {/* 基本情報タブ */}
      {activeTab === "basic" && (
        <div className="space-y-4">
          {mode === "create" && (
            <div className="form-group">
              <label htmlFor="id" className="form-label">
                コンテンツID <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="id"
                type="text"
                className="form-input"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                placeholder="apple01"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                例: apple01 → content-apple01.db として保存されます
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              タイトル <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="コンテンツのタイトル"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="summary" className="form-label">
              要約
            </label>
            <textarea
              id="summary"
              className="form-textarea"
              value={formData.summary || ""}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder="コンテンツの要約を入力..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="publicUrl" className="form-label">
              公開URL
            </label>
            <input
              id="publicUrl"
              type="text"
              className="form-input"
              value={formData.publicUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, publicUrl: e.target.value })
              }
              placeholder="/path/to/content"
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
            <label htmlFor="visibility" className="form-label">
              可視性
            </label>
            <select
              id="visibility"
              className="form-select"
              value={formData.visibility}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({
                  ...formData,
                  visibility: e.target.value as
                    | "public"
                    | "unlisted"
                    | "private"
                    | "draft",
                })
              }
              disabled={isLoading}
            >
              <option value="public">公開</option>
              <option value="unlisted">非公開（URLで共有可）</option>
              <option value="private">プライベート</option>
              <option value="draft">下書き</option>
            </select>
          </div>

          <hr />

          <div className="form-group">
            <label htmlFor="newTag" className="form-label">
              タグ
            </label>
            <div className="d-flex" style={{ gap: "0.5rem" }}>
              <input
                id="newTag"
                type="text"
                className="form-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="タグを入力..."
                disabled={isLoading}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addTag}
                disabled={isLoading}
              >
                +
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div
                className="d-flex"
                style={{ gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}
              >
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge"
                    style={{
                      backgroundColor: "#e9ecef",
                      color: "#495057",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.875rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc3545",
                        cursor: "pointer",
                        padding: "0",
                        marginLeft: "0.25rem",
                      }}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEOタブ */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="metaTitle" className="form-label">
              メタタイトル
            </label>
            <input
              id="metaTitle"
              type="text"
              className="form-input"
              value={seoFields.metaTitle}
              onChange={(e) =>
                setSeoFields({ ...seoFields, metaTitle: e.target.value })
              }
              placeholder="SEO用のタイトル"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="metaDescription" className="form-label">
              メタディスクリプション
            </label>
            <textarea
              id="metaDescription"
              className="form-textarea"
              value={seoFields.metaDescription}
              onChange={(e) =>
                setSeoFields({
                  ...seoFields,
                  metaDescription: e.target.value,
                })
              }
              placeholder="SEO用の説明文（150-160文字推奨）"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <hr />

          <div className="form-group">
            <label htmlFor="ogTitle" className="form-label">
              OG:Title
            </label>
            <input
              id="ogTitle"
              type="text"
              className="form-input"
              value={seoFields.ogTitle}
              onChange={(e) =>
                setSeoFields({ ...seoFields, ogTitle: e.target.value })
              }
              placeholder="SNSシェア用のタイトル"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ogDescription" className="form-label">
              OG:Description
            </label>
            <textarea
              id="ogDescription"
              className="form-textarea"
              value={seoFields.ogDescription}
              onChange={(e) =>
                setSeoFields({ ...seoFields, ogDescription: e.target.value })
              }
              placeholder="SNSシェア用の説明文"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ogImage" className="form-label">
              OG:Image URL
            </label>
            <input
              id="ogImage"
              type="text"
              className="form-input"
              value={seoFields.ogImage}
              onChange={(e) =>
                setSeoFields({ ...seoFields, ogImage: e.target.value })
              }
              placeholder="/images/og-image.jpg"
              disabled={isLoading}
            />
          </div>

          <hr />

          <div className="form-group">
            <label htmlFor="canonical" className="form-label">
              カノニカルURL
            </label>
            <input
              id="canonical"
              type="text"
              className="form-input"
              value={seoFields.canonical}
              onChange={(e) =>
                setSeoFields({ ...seoFields, canonical: e.target.value })
              }
              placeholder="https://example.com/canonical-url"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* 構造タブ */}
      {activeTab === "structure" && (
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="parentId" className="form-label">
              親コンテンツID
            </label>
            <input
              id="parentId"
              type="text"
              className="form-input"
              value={formData.parentId || ""}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              placeholder="parent-content-id"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              階層構造を持たせる場合に親コンテンツのIDを指定
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
              placeholder="/category/subcategory"
              disabled={isLoading}
            />
          </div>

          <div className="row">
            <div className="col col-6">
              <div className="form-group">
                <label htmlFor="depth" className="form-label">
                  階層の深さ
                </label>
                <input
                  id="depth"
                  type="number"
                  className="form-input"
                  value={formData.depth || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depth: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="col col-6">
              <div className="form-group">
                <label htmlFor="order" className="form-label">
                  表示順序
                </label>
                <input
                  id="order"
                  type="number"
                  className="form-input"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 多言語タブ */}
      {activeTab === "i18n" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            多言語対応の設定を行います
          </div>
          <div className="form-group">
            <label htmlFor="defaultLang" className="form-label">
              デフォルト言語
            </label>
            <input
              id="defaultLang"
              type="text"
              className="form-input"
              value={formData.i18n?.defaultLang || formData.lang || "ja"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  i18n: {
                    ...formData.i18n,
                    defaultLang: e.target.value,
                  },
                })
              }
              placeholder="ja"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="translations" className="form-label">
              翻訳マップ（JSON）
            </label>
            <textarea
              id="translations"
              className="form-textarea"
              value={JSON.stringify(formData.i18n?.translations || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      defaultLang:
                        formData.i18n?.defaultLang || formData.lang || "ja",
                      translations: parsed,
                    },
                  });
                } catch {
                  // Invalid JSON - ignore
                }
              }}
              placeholder='{"en": "content-en-001", "zh": "content-zh-001"}'
              rows={4}
              disabled={isLoading}
              style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
            />
            <p className="text-xs text-gray-500">
              言語コードと翻訳先コンテンツIDのマッピング
            </p>
          </div>
        </div>
      )}

      {/* 高度な設定タブ */}
      {activeTab === "advanced" && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">アクセス制御</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="owner" className="form-label">
                  オーナー
                </label>
                <input
                  id="owner"
                  type="text"
                  className="form-input"
                  value={formData.permissions?.owner || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        owner: e.target.value,
                      },
                    })
                  }
                  placeholder="user-id"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="readers" className="form-label">
                  読み取り権限（カンマ区切り）
                </label>
                <input
                  id="readers"
                  type="text"
                  className="form-input"
                  value={formData.permissions?.readers?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        readers: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="user1, user2, user3"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editors" className="form-label">
                  編集権限（カンマ区切り）
                </label>
                <input
                  id="editors"
                  type="text"
                  className="form-input"
                  value={formData.permissions?.editors?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        editors: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="editor1, editor2"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">バージョニング</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="version" className="form-label">
                  バージョン番号
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
                <p className="text-xs text-gray-500">
                  現在のバージョン番号（編集のたびに自動増加）
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">拡張フィールド（JSON）</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="ext" className="form-label">
                  カスタムデータ（JSON形式）
                </label>
                <textarea
                  id="ext"
                  className="form-textarea"
                  value={JSON.stringify(formData.ext || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, ext: parsed });
                    } catch {
                      // Invalid JSON - ignore
                    }
                  }}
                  placeholder='{"customField": "value"}'
                  rows={6}
                  disabled={isLoading}
                  style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                />
                <p className="text-xs text-gray-500">
                  プロジェクト固有のカスタムフィールドをJSON形式で追加できます
                </p>
              </div>
            </div>
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
