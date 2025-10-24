"use client";

import { useCallback, useEffect, useState } from "react";

interface DatabaseInfo {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  isActive: boolean;
}

interface DatabaseStats {
  contentsCount: number;
  markdownPagesCount: number;
  tagsCount: number;
  fileSize: number;
}

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<DatabaseInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // データベース一覧を取得
  const fetchDatabases = useCallback(async () => {
    try {
      const response = await fetch("/api/databases");
      const data = await response.json();
      // データが配列でない場合は空配列を設定
      setDatabases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch databases:", error);
      setDatabases([]);
    }
  }, []);

  // 統計情報を取得
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/databases/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchDatabases();
    fetchStats();
  }, [fetchDatabases, fetchStats]);

  // 新しいデータベースを作成
  const handleCreateDatabase = async (data: Partial<DatabaseInfo>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        await fetchDatabases();
        await fetchStats();
      } else {
        const error = await response.json();
        alert(
          `データベースの作成に失敗しました: ${error.error || "不明なエラー"}`,
        );
      }
    } catch (error) {
      console.error("Failed to create database:", error);
      alert("データベースの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // データベースを編集
  const handleEditDatabase = async (data: Partial<DatabaseInfo>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/databases", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setEditingDatabase(null);
        setIsEditDialogOpen(false);
        await fetchDatabases();
        await fetchStats();
      } else {
        const error = await response.json();
        alert(
          `データベースの更新に失敗しました: ${error.error || "不明なエラー"}`,
        );
      }
    } catch (error) {
      console.error("Failed to edit database:", error);
      alert("データベースの編集に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // データベースを削除
  const handleDeleteDatabase = async (id: string) => {
    if (!confirm("このデータベースを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/databases?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDatabases();
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete database:", error);
      alert("データベースの削除に失敗しました");
    }
  };

  // 編集ダイアログを開く
  const openEditDialog = (database: DatabaseInfo) => {
    setEditingDatabase({ ...database });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                データベース管理
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                プロジェクト内のデータベースファイルを管理します
              </p>

              {/* 統計情報をカード形式で表示 */}
              {stats && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="card p-6">
                    <div className="text-3xl font-bold text-primary-600">
                      {stats.contentsCount}
                    </div>
                    <div className="text-sm text-gray-600">コンテンツ数</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-3xl font-bold text-primary-600">
                      {stats.markdownPagesCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Markdownページ数
                    </div>
                  </div>
                  <div className="card p-6">
                    <div className="text-3xl font-bold text-primary-600">
                      {stats.tagsCount}
                    </div>
                    <div className="text-sm text-gray-600">タグ数</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-3xl font-bold text-primary-600">
                      {(stats.fileSize / 1024).toFixed(1)} KB
                    </div>
                    <div className="text-sm text-gray-600">合計サイズ</div>
                  </div>
                </div>
              )}

              {/* ナビゲーションリンク */}
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
                >
                  ← コンテンツ管理
                </a>
                <a
                  href="/markdown"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
                >
                  → Markdown管理
                </a>
                <a
                  href="/media"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
                >
                  → メディア管理
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
            <div className="card mx-4 w-full max-w-lg animate-scale-in">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  新しいデータベースを作成
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  データベースの基本情報を入力してください
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get("name") as string,
                    description: formData.get("description") as string,
                  };
                  handleCreateDatabase(data);
                }}
              >
                <div className="px-6 pb-4">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      データベース名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      placeholder="my-database"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      説明
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-textarea"
                      placeholder="データベースの説明"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "作成中..." : "作成"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 編集ダイアログ */}
        {isEditDialogOpen && editingDatabase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="card mx-4 w-full max-w-lg animate-scale-in">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  データベースを編集
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  データベースの情報を編集できます
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    id: editingDatabase.id,
                    name: formData.get("name") as string,
                    description: formData.get("description") as string,
                  };
                  handleEditDatabase(data);
                }}
              >
                <div className="px-6 pb-4">
                  <div className="form-group">
                    <label htmlFor="edit-name" className="form-label">
                      データベース名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-name"
                      name="name"
                      type="text"
                      className="form-input"
                      defaultValue={editingDatabase.name}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-description" className="form-label">
                      説明
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      className="form-textarea"
                      defaultValue={editingDatabase.description || ""}
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "保存中..." : "保存"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {databases.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600">
              データベースがまだありません。新規作成ボタンから作成してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {databases.map((database) => (
              <button
                key={database.id}
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
                      {database.name}
                    </h3>
                    <div className="ml-2 flex-shrink-0">
                      {database.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          アクティブ
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          非アクティブ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">ID:</span> {database.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">作成日:</span>{" "}
                      {new Date(database.createdAt).toLocaleDateString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">サイズ:</span>{" "}
                      {(database.size / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {database.description || "説明はありません"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {database.updatedAt
                        ? new Date(database.updatedAt).toLocaleDateString(
                            "ja-JP",
                          )
                        : "未更新"}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(database);
                        }}
                      >
                        ✏️ 編集
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDatabase(database.id);
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
