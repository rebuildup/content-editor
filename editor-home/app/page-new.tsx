"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Database,
  Image as ImageIcon,
  BarChart3,
  FolderOpen,
  X,
} from "lucide-react";
import { ContentForm } from "@/components/content-form";
import Link from "next/link";
import type { Content } from "@/types/content";

interface DbStats {
  totalContents: number;
  totalDbFiles: number;
  totalSize: number;
  contentsList: Array<{
    id: string;
    title: string;
    dbFile: string;
    size: number;
  }>;
}

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // コンテンツ一覧を取得
  const fetchContents = useCallback(async () => {
    try {
      const response = await fetch("/api/contents");
      const data = await response.json();
      setContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch contents:", error);
      setContents([]);
    }
  }, []);

  // 統計情報を取得
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/contents/stats");
      const data = await response.json();
      setDbStats(data || null);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setDbStats(null);
    }
  }, []);

  // 初回ロード時にコンテンツを取得
  useEffect(() => {
    fetchContents();
    fetchStats();
  }, [fetchContents, fetchStats]);

  // 新規コンテンツ作成
  const handleCreateContent = async (data: Partial<Content>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        await fetchContents();
        await fetchStats();
      } else {
        const error = await response.json();
        alert(
          `コンテンツの作成に失敗しました: ${error.error || "不明なエラー"}`,
        );
      }
    } catch (error) {
      console.error("Failed to create content:", error);
      alert("コンテンツの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンテンツ編集
  const handleEditContent = async (data: Partial<Content>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingContent(null);
        await fetchContents();
        await fetchStats();
      } else {
        const error = await response.json();
        alert(
          `コンテンツの更新に失敗しました: ${error.error || "不明なエラー"}`,
        );
      }
    } catch (error) {
      console.error("Failed to update content:", error);
      alert("コンテンツの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンテンツ削除
  const handleDeleteContent = async (id: string) => {
    if (!confirm("このコンテンツを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/contents?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchContents();
        await fetchStats();
      } else {
        const error = await response.json();
        alert(
          `コンテンツの削除に失敗しました: ${error.error || "不明なエラー"}`,
        );
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
      alert("コンテンツの削除に失敗しました");
    }
  };

  // 編集ダイアログを開く
  const openEditDialog = (content: Content) => {
    setEditingContent({ ...content });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-tight py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                コンテンツ管理
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                プロジェクト内のコンテンツを管理します
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn btn-primary btn-lg"
            >
              <Plus className="h-5 w-5" />
              新規作成
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container-tight py-8">
        {/* 統計情報 */}
        {dbStats && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="card stat-card">
              <BarChart3 className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="stat-value">{dbStats.totalContents || 0}</div>
              <div className="stat-label">コンテンツ数</div>
            </div>
            <div className="card stat-card">
              <Database className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="stat-value">{dbStats.totalDbFiles || 0}</div>
              <div className="stat-label">データベース</div>
            </div>
            <div className="card stat-card">
              <FolderOpen className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="stat-value">
                {((dbStats.totalSize || 0) / 1024).toFixed(1)} KB
              </div>
              <div className="stat-label">合計サイズ</div>
            </div>
            <div className="card stat-card">
              <FileText className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="stat-value">
                {dbStats.contentsList?.length || 0}
              </div>
              <div className="stat-label">アクティブ</div>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <nav className="mb-8">
          <div className="flex gap-3 flex-wrap">
            <Link href="/markdown" className="btn btn-secondary">
              <FileText className="h-4 w-4" />
              Markdownページ
            </Link>
            <Link href="/media" className="btn btn-secondary">
              <ImageIcon className="h-4 w-4" />
              メディア管理
            </Link>
            <Link href="/databases" className="btn btn-secondary">
              <Database className="h-4 w-4" />
              データベース管理
            </Link>
          </div>
        </nav>

        {/* コンテンツ一覧 */}
        {contents.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              コンテンツがありません
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              新規作成ボタンから最初のコンテンツを作成してください
            </p>
            <button
              type="button"
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              コンテンツを作成
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <article
                key={content.id}
                className="card card-hover content-card group"
              >
                <div className="content-card-header">
                  <h3 className="content-card-title line-clamp-2">
                    {content.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-secondary text-xs">
                      {content.status || "draft"}
                    </span>
                  </div>
                </div>

                <div className="content-card-meta">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">ID:</span>{" "}
                    {content.id}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      作成日:
                    </span>{" "}
                    {new Date(content.createdAt || new Date()).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </div>
                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {content.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge badge-outline text-xs">
                          {tag}
                        </span>
                      ))}
                      {content.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{content.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {content.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {content.summary}
                  </p>
                )}

                <div className="content-card-actions">
                  <button
                    type="button"
                    onClick={() => openEditDialog(content)}
                    className="btn btn-sm btn-secondary flex-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContent(content.id)}
                    className="btn btn-sm btn-ghost text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 作成ダイアログ */}
      {isCreateDialogOpen && (
        <div
          className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsCreateDialogOpen(false)}
        >
          <div
            className="dialog-content max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="dialog-title">新しいコンテンツを作成</h2>
                  <p className="dialog-description mt-2">
                    コンテンツの基本情報を入力してください
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ContentForm mode="create" onSubmit={handleCreateContent} />
            <div className="dialog-footer">
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編集ダイアログ */}
      {isEditDialogOpen && editingContent && (
        <div
          className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsEditDialogOpen(false);
            setEditingContent(null);
          }}
        >
          <div
            className="dialog-content max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="dialog-title">コンテンツを編集</h2>
                  <p className="dialog-description mt-2">
                    コンテンツの情報を更新してください
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingContent(null);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ContentForm
              mode="edit"
              initialData={editingContent}
              onSubmit={handleEditContent}
            />
            <div className="dialog-footer">
              <button
                type="button"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingContent(null);
                }}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

