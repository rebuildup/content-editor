"use client";

import { useCallback, useEffect, useState } from "react";
import { MarkdownForm } from "@/components/markdown-form";
import type { MarkdownPage } from "@/types/markdown";
import Link from "next/link";
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
  Typography,
} from "@mui/material";
import Grid2 from "../components/Grid2";

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

  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch("/api/markdown");
      const data = await response.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch markdown pages:", error);
      setPages([]);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

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

  const openEditDialog = (page: MarkdownPage) => {
    setEditingPage({ ...page });
    setIsEditDialogOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", lg: "flex-start" },
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                Markdownページ管理
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                プロジェクト内のMarkdownページを管理します
              </Typography>

              <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Button component={Link} href="/" variant="outlined">
                  ← コンテンツ管理
                </Button>
                <Button component={Link} href="/media" variant="outlined">
                  → メディア管理
                </Button>
                <Button component={Link} href="/databases" variant="outlined">
                  → データベース管理
                </Button>
              </Box>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                ➕ 新規作成
              </Button>
            </Box>
          </Box>
        </Box>

        {pages.length === 0 ? (
          <Card>
            <CardContent sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Markdownページがまだありません。新規作成ボタンから作成してください。
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid2 container spacing={3}>
            {pages.map((page) => (
              <Grid2 xs={12} sm={6} lg={4} key={page.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
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
                        }}
                      >
                        {page.frontmatter?.title || page.slug}
                      </Typography>
                      <Box sx={{ ml: 1, flexShrink: 0 }}>
                        <Chip
                          label={String(page.frontmatter?.status ?? "draft")}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <strong>スラッグ:</strong> {page.slug}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>作成日:</strong>{" "}
                        {new Date(page.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                      {page.frontmatter?.tags &&
                        page.frontmatter.tags.length > 0 && (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {page.frontmatter.tags.slice(0, 3).map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {page.frontmatter.tags.length > 3 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                +{page.frontmatter.tags.length - 3} more
                              </Typography>
                            )}
                          </Box>
                        )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {page.body?.length || 0} 文字
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchStats(page.id);
                          }}
                        >
                          📊
                        </IconButton>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(page);
                          }}
                        >
                          ✏️ 編集
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id);
                          }}
                        >
                          🗑️
                        </Button>
                      </Box>
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">新しいMarkdownページを作成</Typography>
          <Typography variant="body2" color="text.secondary">
            ページの基本情報を入力してください
          </Typography>
        </DialogTitle>
        <DialogContent>
          <MarkdownForm
            mode="create"
            onSubmit={handleCreatePage}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Markdownページを編集</Typography>
          <Typography variant="body2" color="text.secondary">
            ページの情報を編集できます
          </Typography>
        </DialogTitle>
        <DialogContent>
          {editingPage && (
            <MarkdownForm
              mode="edit"
              initialData={editingPage}
              onSubmit={handleEditPage}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isStatsDialogOpen}
        onClose={() => setIsStatsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">ページ統計</Typography>
          <Typography variant="body2" color="text.secondary">
            このページの詳細な統計情報
          </Typography>
        </DialogTitle>
        <DialogContent>
          {currentStats && (
            <Grid2 container spacing={2} sx={{ mt: 1 }}>
              <Grid2 xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.characterCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      文字数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.wordCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      単語数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.lineCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      行数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.headingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      見出し数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.linkCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      リンク数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.imageCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      画像数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStats.readingTime} 分
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      推定読書時間
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            </Grid2>
          )}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsStatsDialogOpen(false)}
            >
              閉じる
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
