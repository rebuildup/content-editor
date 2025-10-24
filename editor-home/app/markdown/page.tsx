"use client";

import { useCallback, useEffect, useState } from "react";
import { MarkdownForm } from "@/components/markdown-form";
import type { MarkdownPage } from "@/types/markdown";

interface MarkdownStats {
  characterCount: number;
  wordCount: number;
  lineCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  readingTime: number;
}

export default function MarkdownEditorPage() {
  const [pages, setPages] = useState<MarkdownPage[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<MarkdownPage | null>(null);
  const [currentStats, setCurrentStats] = useState<MarkdownStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ページ一覧を取得
  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch("/api/markdown");
      const data = await response.json();
      // データが配列でない場合は空配列を設定
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch markdown pages:", error);
      setPages([]);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // 新規ページ作成
  const handleCreatePage = async (data: Partial<MarkdownPage>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        await fetchPages();
      } else {
        const error = await response.json();
        alert(`ページの作成に失敗しました: ${error.error || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
      alert("ページの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ページ編集
  const handleEditPage = async (data: Partial<MarkdownPage>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/markdown", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setEditingPage(null);
        setIsEditDialogOpen(false);
        await fetchPages();
      } else {
        const error = await response.json();
        alert(`ページの更新に失敗しました: ${error.error || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("Failed to edit page:", error);
      alert("ページの編集に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ページ削除
  const handleDeletePage = async (id: string) => {
    if (!confirm("このページを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/markdown?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPages();
      }
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("ページの削除に失敗しました");
    }
  };

  // 統計情報を取得
  const fetchStats = async (id: string) => {
    try {
      const response = await fetch(`/api/markdown/stats?id=${id}`);
      const data = await response.json();
      setCurrentStats(data);
      setIsStatsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      alert("統計情報の取得に失敗しました");
    }
  };

  // 編集ダイアログを開く
  const openEditDialog = (page: MarkdownPage) => {
    setEditingPage({ ...page });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                Markdownページ管理
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                プロジェクト内のMarkdownページを管理します
              </p>

              {/* ナビゲーションリンク */}
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
                >
                  ← コンテンツ管理
                </a>
                <a
                  href="/media"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
                >
                  → メディア管理
                </a>
                <a
                  href="/databases"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
                >
                  → データベース管理
                </a>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                className="btn btn-primary w-full sm:w-auto"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                ➕ 新規作成
              </button>
            </div>
          </div>
        </div>

        {/* 作成ダイアログ */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="card mx-4 w-full max-w-4xl animate-scale-in">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  新しいMarkdownページを作成
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  ページの基本情報を入力してください
                </p>
              </div>
              <MarkdownForm
                mode="create"
                onSubmit={handleCreatePage}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* 編集ダイアログ */}
        {isEditDialogOpen && editingPage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="card mx-4 w-full max-w-4xl animate-scale-in">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Markdownページを編集
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  ページの情報を編集できます
                </p>
              </div>
              <MarkdownForm
                mode="edit"
                initialData={editingPage}
                onSubmit={handleEditPage}
                onCancel={() => setIsEditDialogOpen(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* 統計ダイアログ */}
        {isStatsDialogOpen && currentStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="card mx-4 w-full max-w-2xl animate-scale-in">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  ページ統計
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  このページの詳細な統計情報
                </p>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.characterCount}
                    </div>
                    <div className="text-sm text-gray-600">文字数</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.wordCount}
                    </div>
                    <div className="text-sm text-gray-600">単語数</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.lineCount}
                    </div>
                    <div className="text-sm text-gray-600">行数</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.headingCount}
                    </div>
                    <div className="text-sm text-gray-600">見出し数</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.linkCount}
                    </div>
                    <div className="text-sm text-gray-600">リンク数</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.imageCount}
                    </div>
                    <div className="text-sm text-gray-600">画像数</div>
                  </div>
                  <div className="col-span-full rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentStats.readingTime} 分
                    </div>
                    <div className="text-sm text-gray-600">推定読書時間</div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => setIsStatsDialogOpen(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600">
              Markdownページがまだありません。新規作成ボタンから作成してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className="card group text-left transition-all hover:shadow-medium"
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
                onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0, 0, 0, 0.1)";
                }}
                onBlur={(e: React.FocusEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {page.frontmatter?.title || page.slug}
                    </h3>
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                        {String(page.frontmatter?.status ?? "draft")}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">スラッグ:</span> {page.slug}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">作成日:</span>{" "}
                      {new Date(page.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {page.frontmatter?.tags &&
                      page.frontmatter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {page.frontmatter.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {page.frontmatter.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{page.frontmatter.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {page.body?.length || 0} 文字
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchStats(page.id);
                        }}
                      >
                        📊
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary text-xs flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(page);
                        }}
                      >
                        ✏️ 編集
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(page.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
