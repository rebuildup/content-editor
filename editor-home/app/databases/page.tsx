"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Grid2 from "../components/Grid2";

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

  const fetchDatabases = useCallback(async () => {
    try {
      const response = await fetch("/api/databases");
      const data = await response.json();
      setDatabases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch databases:", error);
      setDatabases([]);
    }
  }, []);

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

  const openEditDialog = (database: DatabaseInfo) => {
    setEditingDatabase({ ...database });
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
                データベース管理
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                プロジェクト内のデータベースファイルを管理します
              </Typography>

              {stats && (
                <Grid2 container spacing={2} sx={{ mt: 3 }}>
                  <Grid2 xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {stats.contentsCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          コンテンツ数
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                  <Grid2 xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {stats.markdownPagesCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Markdownページ数
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                  <Grid2 xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {stats.tagsCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          タグ数
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                  <Grid2 xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {(stats.fileSize / 1024).toFixed(1)} KB
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          合計サイズ
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                </Grid2>
              )}

              <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Button component={Link} href="/" variant="outlined">
                  ← コンテンツ管理
                </Button>
                <Button component={Link} href="/markdown" variant="outlined">
                  → Markdown管理
                </Button>
                <Button component={Link} href="/media" variant="outlined">
                  → メディア管理
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

        {databases.length === 0 ? (
          <Card>
            <CardContent sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                データベースがまだありません。新規作成ボタンから作成してください。
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid2 container spacing={3}>
            {databases.map((database) => (
              <Grid2 xs={12} sm={6} lg={4} key={database.id}>
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
                        {database.name}
                      </Typography>
                      <Box sx={{ ml: 1, flexShrink: 0 }}>
                        {database.isActive ? (
                          <Chip
                            label="アクティブ"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="非アクティブ"
                            color="default"
                            size="small"
                          />
                        )}
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
                        <strong>ID:</strong> {database.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>作成日:</strong>{" "}
                        {new Date(database.createdAt).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>サイズ:</strong>{" "}
                        {(database.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {database.description || "説明はありません"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {database.updatedAt
                          ? new Date(database.updatedAt).toLocaleDateString(
                              "ja-JP",
                            )
                          : "未更新"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(database);
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
                            handleDeleteDatabase(database.id);
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>新しいデータベースを作成</DialogTitle>
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
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              データベースの基本情報を入力してください
            </Typography>
            <TextField
              name="name"
              label="データベース名"
              fullWidth
              required
              disabled={isLoading}
              placeholder="my-database"
              sx={{ mb: 2 }}
            />
            <TextField
              name="description"
              label="説明"
              fullWidth
              multiline
              rows={3}
              disabled={isLoading}
              placeholder="データベースの説明"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? "作成中..." : "作成"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>データベースを編集</DialogTitle>
        {editingDatabase && (
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
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                データベースの情報を編集できます
              </Typography>
              <TextField
                name="name"
                label="データベース名"
                fullWidth
                required
                defaultValue={editingDatabase.name}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                name="description"
                label="説明"
                fullWidth
                multiline
                rows={3}
                defaultValue={editingDatabase.description || ""}
                disabled={isLoading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </Box>
  );
}
