"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Content {
  id: string;
  title: string;
  summary?: string;
  tags?: string[];
  lang?: string;
  status?: string;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({ title: "", summary: "" });
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // コンテンツ一覧を取得
  const fetchContents = async () => {
    try {
      const response = await fetch("/api/contents");
      const data = await response.json();
      setContents(data);
    } catch (error) {
      console.error("Failed to fetch contents:", error);
    }
  };

  // 初回ロード時にコンテンツを取得
  useEffect(() => {
    fetchContents();
  }, []);

  // 新しいコンテンツを作成
  const handleCreateContent = async () => {
    if (!newContent.title.trim() || !newContent.summary.trim()) {
      alert("タイトルと要約を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: `content_${Date.now()}`,
          title: newContent.title,
          summary: newContent.summary,
          status: "draft",
          visibility: "draft",
        }),
      });

      if (response.ok) {
        setNewContent({ title: "", summary: "" });
        setIsCreateDialogOpen(false);
        await fetchContents();
      }
    } catch (error) {
      console.error("Failed to create content:", error);
      alert("コンテンツの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンテンツを編集
  const handleEditContent = async () => {
    if (!editingContent || !editingContent.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/contents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingContent.id,
          title: editingContent.title,
          summary: editingContent.summary,
        }),
      });

      if (response.ok) {
        setEditingContent(null);
        setIsEditDialogOpen(false);
        await fetchContents();
      }
    } catch (error) {
      console.error("Failed to edit content:", error);
      alert("コンテンツの編集に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンテンツを削除
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">コンテンツ管理</h1>
            <p className="text-muted-foreground mt-2">
              マークダウン形式でコンテンツを管理します
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新しいコンテンツを作成</DialogTitle>
                <DialogDescription>
                  タイトルと要約を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    value={newContent.title}
                    onChange={(e) =>
                      setNewContent({ ...newContent, title: e.target.value })
                    }
                    placeholder="コンテンツのタイトル"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="summary">要約</Label>
                  <Textarea
                    id="summary"
                    value={newContent.summary}
                    onChange={(e) =>
                      setNewContent({ ...newContent, summary: e.target.value })
                    }
                    placeholder="コンテンツの要約を入力..."
                    rows={6}
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
                <Button onClick={handleCreateContent} disabled={isLoading}>
                  {isLoading ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 編集ダイアログ */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>コンテンツを編集</DialogTitle>
              <DialogDescription>
                タイトルと要約を編集してください
              </DialogDescription>
            </DialogHeader>
            {editingContent && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">タイトル</Label>
                  <Input
                    id="edit-title"
                    value={editingContent.title}
                    onChange={(e) =>
                      setEditingContent({ ...editingContent, title: e.target.value })
                    }
                    placeholder="コンテンツのタイトル"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-summary">要約</Label>
                  <Textarea
                    id="edit-summary"
                    value={editingContent.summary || ""}
                    onChange={(e) =>
                      setEditingContent({ ...editingContent, summary: e.target.value })
                    }
                    placeholder="コンテンツの要約を入力..."
                    rows={6}
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
              <Button onClick={handleEditContent} disabled={isLoading}>
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {contents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                コンテンツがまだありません。新規作成ボタンから作成してください。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <Card key={content.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{content.title}</CardTitle>
                  <CardDescription>
                    {content.createdAt && new Date(content.createdAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {content.summary || ""}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => openEditDialog(content)}
                  >
                    編集
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteContent(content.id)}
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
