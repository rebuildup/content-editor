"use client";

import {
  BarChart3,
  Database,
  Edit,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import Grid2 from "./components/Grid2";
import { ContentForm } from "@/components/content-form";
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

  useEffect(() => {
    fetchContents();
    fetchStats();
  }, [fetchContents, fetchStats]);

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

  const openEditDialog = (content: Content) => {
    setEditingContent({ ...content });
    setIsEditDialogOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Paper
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                コンテンツ管理
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Plus />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              新規作成
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {dbStats && (
          <Grid2 container spacing={3} sx={{ mb: 6 }}>
            <Grid2 xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <BarChart3
                    size={20}
                    style={{ color: "#9ca3af", marginBottom: 12 }}
                  />
                  <Typography variant="h4" component="div" gutterBottom>
                    {dbStats.totalContents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    コンテンツ数
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Database
                    size={20}
                    style={{ color: "#9ca3af", marginBottom: 12 }}
                  />
                  <Typography variant="h4" component="div" gutterBottom>
                    {dbStats.totalDbFiles || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    データベース
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <FolderOpen
                    size={20}
                    style={{ color: "#9ca3af", marginBottom: 12 }}
                  />
                  <Typography variant="h4" component="div" gutterBottom>
                    {((dbStats.totalSize || 0) / 1024).toFixed(1)} KB
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    合計サイズ
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <FileText
                    size={20}
                    style={{ color: "#9ca3af", marginBottom: 12 }}
                  />
                  <Typography variant="h4" component="div" gutterBottom>
                    {dbStats.contentsList?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    アクティブ
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        )}

        <Box sx={{ mb: 6, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Button
            component={Link}
            href="/markdown"
            variant="outlined"
            startIcon={<FileText size={16} />}
          >
            Markdownページ
          </Button>
          <Button
            component={Link}
            href="/media"
            variant="outlined"
            startIcon={<ImageIcon size={16} />}
          >
            メディア管理
          </Button>
          <Button
            component={Link}
            href="/databases"
            variant="outlined"
            startIcon={<Database size={16} />}
          >
            データベース管理
          </Button>
        </Box>

        {contents.length === 0 ? (
          <Card>
            <CardContent
              sx={{
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <FileText size={48} style={{ color: "#9ca3af", marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                コンテンツがありません
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                新規作成ボタンから最初のコンテンツを作成してください
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                コンテンツを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid2 container spacing={3}>
            {contents.map((content) => (
              <Grid2 xs={12} md={6} lg={4} key={content.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          flex: 1,
                        }}
                      >
                        {content.title}
                      </Typography>
                      <Chip
                        label={content.status || "draft"}
                        size="small"
                        color="secondary"
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>ID:</strong> {content.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>作成日:</strong>{" "}
                        {new Date(
                          content.createdAt || new Date(),
                        ).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                      {content.tags && content.tags.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {content.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {content.tags.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{content.tags.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    {content.summary && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {content.summary}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit size={14} />}
                        onClick={() => openEditDialog(content)}
                        sx={{ flex: 1 }}
                      >
                        編集
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Container>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" component="div">
                新しいコンテンツを作成
              </Typography>
              <Typography variant="body2" color="text.secondary">
                コンテンツの基本情報を入力してください
              </Typography>
            </Box>
            <IconButton onClick={() => setIsCreateDialogOpen(false)}>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ContentForm
            mode="create"
            onSubmit={handleCreateContent}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingContent(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" component="div">
                コンテンツを編集
              </Typography>
              <Typography variant="body2" color="text.secondary">
                コンテンツの情報を更新してください
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingContent(null);
              }}
            >
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editingContent && (
            <ContentForm
              mode="edit"
              initialData={editingContent}
              onSubmit={handleEditContent}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingContent(null);
              }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
