"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, BarChart3 } from "lucide-react";

interface MarkdownPage {
  id: string;
  slug: string;
  frontmatter: {
    title?: string;
    description?: string;
    tags?: string[];
    draft?: boolean;
    [key: string]: any;
  };
  lang?: string;
  status?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface MarkdownPageWithBody extends MarkdownPage {
  body: string;
}

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
  const [newPage, setNewPage] = useState({ slug: "", title: "", body: "" });
  const [editingPage, setEditingPage] = useState<MarkdownPageWithBody | null>(null);
  const [currentStats, setCurrentStats] = useState<MarkdownStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ページ一覧を取得
  const fetchPages = async () => {
    try {
      const response = await fetch("/api/markdown");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Failed to fetch markdown pages:", error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // 新規ページ作成
  const handleCreatePage = async () => {
    if (!newPage.slug.trim() || !newPage.title.trim()) {
      alert("スラッグとタイトルを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: newPage.slug,
          frontmatter: {
            title: newPage.title,
          },
          body: newPage.body || "# " + newPage.title,
          status: "draft",
        }),
      });

      if (response.ok) {
        setNewPage({ slug: "", title: "", body: "" });
        setIsCreateDialogOpen(false);
        await fetchPages();
      } else {
        const error = await response.json();
        alert(error.error || "ページの作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create page:", error);
      alert("ページの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ページ編集
  const handleEditPage = async () => {
    if (!editingPage) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/markdown", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingPage.id,
          frontmatter: editingPage.frontmatter,
          body: editingPage.body,
        }),
      });

      if (response.ok) {
        setEditingPage(null);
        setIsEditDialogOpen(false);
        await fetchPages();
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

  // 編集ダイアログを開く
  const openEditDialog = async (page: MarkdownPage) => {
    try {
      const response = await fetch(`/api/markdown?id=${page.id}`);
      const fullPage = await response.json();
      setEditingPage(fullPage);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("ページの読み込みに失敗しました");
    }
  };

  // 統計を計算
  const calculateStats = async (body: string) => {
    try {
      const response = await fetch("/api/markdown/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });
      const stats = await response.json();
      setCurrentStats(stats);
      setIsStatsDialogOpen(true);
    } catch (error) {
      console.error("Failed to calculate stats:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Markdownページ管理</h1>
            <p className="text-muted-foreground mt-2">
              .mdファイルと同等のMarkdownコンテンツを管理します
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="/"
                className="text-sm text-primary hover:underline"
              >
                ← コンテンツ管理
              </a>
              <a
                href="/databases"
                className="text-sm text-primary hover:underline"
              >
                → データベース管理
              </a>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新しいMarkdownページを作成</DialogTitle>
                <DialogDescription>
                  スラッグ、タイトル、本文を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="slug">スラッグ（URL識別子）</Label>
                  <Input
                    id="slug"
                    value={newPage.slug}
                    onChange={(e) =>
                      setNewPage({ ...newPage, slug: e.target.value })
                    }
                    placeholder="my-page"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    value={newPage.title}
                    onChange={(e) =>
                      setNewPage({ ...newPage, title: e.target.value })
                    }
                    placeholder="ページタイトル"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">本文（Markdown）</Label>
                  <Textarea
                    id="body"
                    value={newPage.body}
                    onChange={(e) =>
                      setNewPage({ ...newPage, body: e.target.value })
                    }
                    placeholder="# 見出し&#10;&#10;本文をMarkdown形式で入力..."
                    rows={15}
                    className="font-mono"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreatePage} disabled={isLoading}>
                  {isLoading ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 編集ダイアログ */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Markdownページを編集</DialogTitle>
              <DialogDescription>
                タイトルと本文を編集してください
              </DialogDescription>
            </DialogHeader>
            {editingPage && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">タイトル</Label>
                  <Input
                    id="edit-title"
                    value={editingPage.frontmatter.title || ""}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        frontmatter: {
                          ...editingPage.frontmatter,
                          title: e.target.value,
                        },
                      })
                    }
                    placeholder="ページタイトル"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="edit-body">本文（Markdown）</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => calculateStats(editingPage.body)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      統計
                    </Button>
                  </div>
                  <Textarea
                    id="edit-body"
                    value={editingPage.body}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, body: e.target.value })
                    }
                    placeholder="# 見出し&#10;&#10;本文をMarkdown形式で入力..."
                    rows={20}
                    className="font-mono"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleEditPage} disabled={isLoading}>
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 統計ダイアログ */}
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Markdown統計情報</DialogTitle>
            </DialogHeader>
            {currentStats && (
              <div className="grid gap-3 py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">文字数:</span>
                  <span className="font-mono">{currentStats.characterCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">単語数:</span>
                  <span className="font-mono">{currentStats.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">行数:</span>
                  <span className="font-mono">{currentStats.lineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">見出し数:</span>
                  <span className="font-mono">{currentStats.headingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">リンク数:</span>
                  <span className="font-mono">{currentStats.linkCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">画像数:</span>
                  <span className="font-mono">{currentStats.imageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">読了時間:</span>
                  <span className="font-mono">約{currentStats.readingTime}分</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {pages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Markdownページがまだありません。新規作成ボタンから作成してください。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Card key={page.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">
                        {page.frontmatter.title || page.slug}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {page.slug}
                        </code>
                      </CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {page.frontmatter.description || "説明なし"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {page.frontmatter.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {page.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-4">
                      更新: {new Date(page.updatedAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => openEditDialog(page)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePage(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

