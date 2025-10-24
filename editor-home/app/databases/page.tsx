"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Copy, Database, CheckCircle2, HardDrive } from "lucide-react";

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
  const [activeDatabase, setActiveDatabase] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDbForCopy, setSelectedDbForCopy] = useState<string>("");
  const [newDb, setNewDb] = useState({ id: "", name: "", description: "" });
  const [copyDb, setCopyDb] = useState({ targetId: "", name: "", description: "" });
  const [statsMap, setStatsMap] = useState<Record<string, DatabaseStats>>({});
  const [isLoading, setIsLoading] = useState(false);

  // データベース一覧を取得
  const fetchDatabases = async () => {
    try {
      const response = await fetch("/api/databases");
      const data = await response.json();
      setDatabases(data.databases);
      setActiveDatabase(data.activeDatabase);
      
      // 各データベースの統計を取得
      for (const db of data.databases) {
        fetchStats(db.id);
      }
    } catch (error) {
      console.error("Failed to fetch databases:", error);
    }
  };

  // データベース統計を取得
  const fetchStats = async (id: string) => {
    try {
      const response = await fetch(`/api/databases/stats?id=${encodeURIComponent(id)}`);
      if (response.ok) {
        const stats = await response.json();
        setStatsMap((prev) => ({ ...prev, [id]: stats }));
      }
    } catch (error) {
      console.error(`Failed to fetch stats for ${id}:`, error);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  // データベース作成
  const handleCreateDatabase = async () => {
    if (!newDb.id || !newDb.name) {
      alert("IDと名前は必須です");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id: newDb.id,
          name: newDb.name,
          description: newDb.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "作成に失敗しました");
        return;
      }

      setIsCreateDialogOpen(false);
      setNewDb({ id: "", name: "", description: "" });
      await fetchDatabases();
    } catch (error) {
      console.error("Failed to create database:", error);
      alert("作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // データベースコピー
  const handleCopyDatabase = async () => {
    if (!selectedDbForCopy || !copyDb.targetId || !copyDb.name) {
      alert("必須項目を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "copy",
          sourceId: selectedDbForCopy,
          targetId: copyDb.targetId,
          name: copyDb.name,
          description: copyDb.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "コピーに失敗しました");
        return;
      }

      setIsCopyDialogOpen(false);
      setSelectedDbForCopy("");
      setCopyDb({ targetId: "", name: "", description: "" });
      await fetchDatabases();
    } catch (error) {
      console.error("Failed to copy database:", error);
      alert("コピーに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // データベース切り替え
  const handleSwitchDatabase = async (id: string) => {
    if (id === activeDatabase) return;

    if (!confirm("データベースを切り替えますか？サーバーを再起動する必要があります。")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "switch",
          id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "切り替えに失敗しました");
        return;
      }

      alert("データベースを切り替えました。サーバーを再起動してください。");
      await fetchDatabases();
    } catch (error) {
      console.error("Failed to switch database:", error);
      alert("切り替えに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // データベース削除
  const handleDeleteDatabase = async (id: string, name: string) => {
    if (!confirm(`データベース「${name}」を削除しますか？この操作は元に戻せません。`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/databases?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "削除に失敗しました");
        return;
      }

      await fetchDatabases();
    } catch (error) {
      console.error("Failed to delete database:", error);
      alert("削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ファイルサイズをフォーマット
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">データベース管理</h1>
            <p className="text-muted-foreground mt-2">
              データベースの作成、切り替え、バックアップを管理します
            </p>
            <div className="flex gap-4 mt-4">
              <a href="/" className="text-sm text-primary hover:underline">
                ← コンテンツ管理
              </a>
              <a href="/markdown" className="text-sm text-primary hover:underline">
                Markdownページ管理
              </a>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規データベース作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規データベース作成</DialogTitle>
                <DialogDescription>
                  新しい空のデータベースを作成します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="db-id">データベースID（ファイル名）</Label>
                  <Input
                    id="db-id"
                    placeholder="example-db"
                    value={newDb.id}
                    onChange={(e) => setNewDb({ ...newDb, id: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    自動的に.dbが付与されます
                  </p>
                </div>
                <div>
                  <Label htmlFor="db-name">表示名</Label>
                  <Input
                    id="db-name"
                    placeholder="サンプルデータベース"
                    value={newDb.name}
                    onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="db-desc">説明（任意）</Label>
                  <Textarea
                    id="db-desc"
                    placeholder="このデータベースの用途..."
                    value={newDb.description}
                    onChange={(e) => setNewDb({ ...newDb, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreateDatabase} disabled={isLoading}>
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* アクティブなデータベース */}
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              アクティブなデータベース
            </CardTitle>
            <CardDescription>
              現在使用中のデータベース（サーバー再起動で反映）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono">{activeDatabase}</div>
          </CardContent>
        </Card>

        {/* データベース一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.map((db) => {
            const stats = statsMap[db.id];
            return (
              <Card
                key={db.id}
                className={db.isActive ? "border-primary shadow-md" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {db.name}
                    {db.isActive && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {db.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {db.description && (
                    <p className="text-sm text-muted-foreground">
                      {db.description}
                    </p>
                  )}

                  {/* 統計情報 */}
                  {stats && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">コンテンツ:</span>
                        <span className="font-semibold">{stats.contentsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Markdownページ:</span>
                        <span className="font-semibold">{stats.markdownPagesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">タグ:</span>
                        <span className="font-semibold">{stats.tagsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ファイルサイズ:</span>
                        <span className="font-semibold">{formatSize(stats.fileSize)}</span>
                      </div>
                    </div>
                  )}

                  {/* メタ情報 */}
                  <div className="space-y-1 text-xs text-muted-foreground border-t pt-3">
                    <div>作成: {new Date(db.createdAt).toLocaleString("ja-JP")}</div>
                    <div>更新: {new Date(db.updatedAt).toLocaleString("ja-JP")}</div>
                    <div>サイズ: {formatSize(db.size)}</div>
                  </div>

                  {/* アクション */}
                  <div className="flex gap-2 pt-3">
                    {!db.isActive && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSwitchDatabase(db.id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <HardDrive className="mr-2 h-4 w-4" />
                          切り替え
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDbForCopy(db.id);
                            setCopyDb({
                              targetId: `${db.id.replace('.db', '')}-copy`,
                              name: `${db.name} のコピー`,
                              description: db.description || "",
                            });
                            setIsCopyDialogOpen(true);
                          }}
                          disabled={isLoading}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDatabase(db.id, db.name)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {db.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDbForCopy(db.id);
                          setCopyDb({
                            targetId: `${db.id.replace('.db', '')}-backup`,
                            name: `${db.name} のバックアップ`,
                            description: `${new Date().toLocaleString("ja-JP")} のバックアップ`,
                          });
                          setIsCopyDialogOpen(true);
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        バックアップ作成
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* データベースコピーダイアログ */}
        <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>データベースをコピー</DialogTitle>
              <DialogDescription>
                既存のデータベースをバックアップまたは複製します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>コピー元</Label>
                <div className="font-mono text-sm mt-1">{selectedDbForCopy}</div>
              </div>
              <div>
                <Label htmlFor="copy-target-id">コピー先ID（ファイル名）</Label>
                <Input
                  id="copy-target-id"
                  placeholder="example-db-copy"
                  value={copyDb.targetId}
                  onChange={(e) =>
                    setCopyDb({ ...copyDb, targetId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="copy-name">表示名</Label>
                <Input
                  id="copy-name"
                  placeholder="サンプルデータベース（コピー）"
                  value={copyDb.name}
                  onChange={(e) => setCopyDb({ ...copyDb, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="copy-desc">説明（任意）</Label>
                <Textarea
                  id="copy-desc"
                  placeholder="バックアップの説明..."
                  value={copyDb.description}
                  onChange={(e) =>
                    setCopyDb({ ...copyDb, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCopyDialogOpen(false)}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button onClick={handleCopyDatabase} disabled={isLoading}>
                コピー
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

