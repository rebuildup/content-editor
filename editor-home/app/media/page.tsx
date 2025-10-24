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
import { Plus, Trash2, Image as ImageIcon, Download } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface PublicImageFile {
  filename: string;
  size: number;
  mimeType: string;
}

interface MediaStats {
  totalCount: number;
  totalSize: number;
  byMimeType: Record<string, number>;
}

export default function MediaPage() {
  const [contentId, setContentId] = useState("apple01"); // デフォルトのコンテンツID
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null);
  const [publicImages, setPublicImages] = useState<PublicImageFile[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");

  // メディア一覧を取得
  const fetchMedia = async () => {
    if (!contentId) return;

    try {
      const response = await fetch(`/api/media?contentId=${encodeURIComponent(contentId)}`);
      if (response.ok) {
        const data = await response.json();
        setMediaList(data);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    }
  };

  // メディア統計を取得
  const fetchStats = async () => {
    if (!contentId) return;

    try {
      const response = await fetch(`/api/media/stats?contentId=${encodeURIComponent(contentId)}`);
      if (response.ok) {
        const data = await response.json();
        setMediaStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // publicフォルダの画像一覧を取得
  const fetchPublicImages = async () => {
    try {
      const response = await fetch("/api/media/import-public");
      if (response.ok) {
        const data = await response.json();
        setPublicImages(data);
      }
    } catch (error) {
      console.error("Failed to fetch public images:", error);
    }
  };

  useEffect(() => {
    if (contentId) {
      fetchMedia();
      fetchStats();
    }
  }, [contentId]);

  // publicフォルダから画像をインポート
  const handleImportPublicImage = async (filename: string) => {
    if (!contentId) {
      alert("コンテンツIDを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/media/import-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          filename,
          alt: filename,
          description: `Imported from public/${filename}`,
        }),
      });

      if (response.ok) {
        setIsImportDialogOpen(false);
        await fetchMedia();
        await fetchStats();
      } else {
        alert("インポートに失敗しました");
      }
    } catch (error) {
      console.error("Failed to import image:", error);
      alert("インポートに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ファイルアップロード
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);

    // プレビュー生成
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadMedia = async () => {
    if (!contentId || !uploadFile) {
      alert("コンテンツIDとファイルを指定してください");
      return;
    }

    setIsLoading(true);
    try {
      // ファイルをBase64に変換
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string).split(",")[1];

        const response = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentId,
            filename: uploadFile.name,
            mimeType: uploadFile.type,
            base64Data,
            alt: uploadFile.name,
          }),
        });

        if (response.ok) {
          setIsUploadDialogOpen(false);
          setUploadFile(null);
          setUploadPreview("");
          await fetchMedia();
          await fetchStats();
        } else {
          alert("アップロードに失敗しました");
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      console.error("Failed to upload media:", error);
      alert("アップロードに失敗しました");
      setIsLoading(false);
    }
  };

  // メディア削除
  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("この画像を削除しますか？")) return;

    try {
      const response = await fetch(
        `/api/media?contentId=${encodeURIComponent(contentId)}&id=${encodeURIComponent(mediaId)}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        await fetchMedia();
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert("削除に失敗しました");
    }
  };

  // 画像を表示
  const viewImage = async (mediaId: string) => {
    try {
      const response = await fetch(
        `/api/media?contentId=${encodeURIComponent(contentId)}&id=${encodeURIComponent(mediaId)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedImage(data);
      }
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

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
            <h1 className="text-4xl font-bold tracking-tight">メディア管理</h1>
            <p className="text-muted-foreground mt-2">
              画像のバイナリデータをデータベースに保存
            </p>
            {mediaStats && (
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>画像数: {mediaStats.totalCount}</span>
                <span>合計サイズ: {formatSize(mediaStats.totalSize)}</span>
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <a href="/" className="text-sm text-primary hover:underline">
                ← コンテンツ管理
              </a>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
              setIsImportDialogOpen(open);
              if (open) fetchPublicImages();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  publicからインポート
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>publicフォルダから画像をインポート</DialogTitle>
                  <DialogDescription>
                    publicフォルダ内の画像をデータベースに取り込みます
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                  {publicImages.map((img) => (
                    <Card key={img.filename} className="cursor-pointer hover:shadow-lg transition">
                      <CardHeader>
                        <CardTitle className="text-sm truncate">{img.filename}</CardTitle>
                        <CardDescription className="text-xs">
                          {formatSize(img.size)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={`/${img.filename}`}
                          alt={img.filename}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleImportPublicImage(img.filename)}
                          disabled={isLoading}
                        >
                          インポート
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  画像アップロード
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>画像をアップロード</DialogTitle>
                  <DialogDescription>
                    画像ファイルを選択してデータベースに保存します
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="file-upload">画像ファイル</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  {uploadPreview && (
                    <div>
                      <Label>プレビュー</Label>
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded border"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={isLoading}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleUploadMedia} disabled={isLoading || !uploadFile}>
                    {isLoading ? "アップロード中..." : "アップロード"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* コンテンツID入力 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>対象コンテンツ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="content-id">コンテンツID</Label>
                <Input
                  id="content-id"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  placeholder="apple01"
                />
              </div>
              <Button onClick={() => { fetchMedia(); fetchStats(); }}>
                読み込み
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* メディア一覧 */}
        {mediaList.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                画像がまだありません。アップロードまたはインポートしてください。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaList.map((media) => (
              <Card key={media.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm truncate">{media.filename}</CardTitle>
                  <CardDescription className="text-xs">
                    {formatSize(media.size)} • {media.mimeType}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div
                    className="w-full h-32 bg-muted rounded flex items-center justify-center cursor-pointer hover:bg-muted/80 transition"
                    onClick={() => viewImage(media.id)}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => viewImage(media.id)}
                    >
                      表示
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMedia(media.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 画像表示ダイアログ */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImage?.filename}</DialogTitle>
              <DialogDescription>
                {selectedImage?.mimeType} • {selectedImage && formatSize(selectedImage.size)}
                {selectedImage?.width && selectedImage?.height && (
                  <> • {selectedImage.width} × {selectedImage.height}</>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedImage?.base64 && (
              <div className="max-h-[60vh] overflow-auto">
                <img
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`}
                  alt={selectedImage.alt || selectedImage.filename}
                  className="w-full"
                />
              </div>
            )}
            {selectedImage?.description && (
              <div className="text-sm text-muted-foreground">
                {selectedImage.description}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

