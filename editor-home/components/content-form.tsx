"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { Content } from "@/types/content";
import Grid2 from "../app/components/Grid2";

interface ContentFormProps {
  initialData?: Partial<Content>;
  onSubmit: (data: Partial<Content>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function ContentForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: ContentFormProps) {
  const [formData, setFormData] = useState<Partial<Content>>({
    id: initialData.id || "",
    title: initialData.title || "",
    summary: initialData.summary || "",
    lang: initialData.lang || "ja",
    status: initialData.status || "draft",
    visibility: initialData.visibility || "draft",
    tags: initialData.tags || [],
    publicUrl: initialData.publicUrl || "",
    parentId: initialData.parentId || "",
    path: initialData.path || "",
    depth: initialData.depth || 0,
    order: initialData.order || 0,
    seo: initialData.seo || undefined,
    searchable: initialData.searchable || undefined,
    i18n: initialData.i18n || undefined,
    permissions: initialData.permissions || undefined,
    ext: initialData.ext || undefined,
    ...initialData,
  });

  const [newTag, setNewTag] = useState("");
  const [seoFields, setSeoFields] = useState({
    metaTitle: formData.seo?.meta?.title || "",
    metaDescription: formData.seo?.meta?.description || "",
    ogTitle: formData.seo?.openGraph?.title || "",
    ogDescription: formData.seo?.openGraph?.description || "",
    ogImage: formData.seo?.openGraph?.image || "",
    canonical: formData.seo?.meta?.canonical || "",
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seo =
      seoFields.metaTitle || seoFields.metaDescription || seoFields.canonical
        ? {
            meta: {
              title: seoFields.metaTitle || undefined,
              description: seoFields.metaDescription || undefined,
              canonical: seoFields.canonical || undefined,
            },
            openGraph: {
              title: seoFields.ogTitle || undefined,
              description: seoFields.ogDescription || undefined,
              image: seoFields.ogImage || undefined,
            },
          }
        : undefined;

    onSubmit({
      ...formData,
      seo: seo,
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  const tabs = [
    { label: "基本情報" },
    { label: "SEO" },
    { label: "構造" },
    { label: "多言語" },
    { label: "高度な設定" },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {mode === "create" && (
              <TextField
                label="コンテンツID"
                required
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                placeholder="apple01"
                disabled={isLoading}
                helperText="例: apple01 → content-apple01.db として保存されます"
              />
            )}

            <TextField
              label="タイトル"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="コンテンツのタイトル"
              disabled={isLoading}
            />

            <TextField
              label="要約"
              multiline
              rows={4}
              value={formData.summary || ""}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder="コンテンツの要約を入力..."
              disabled={isLoading}
            />

            <TextField
              label="公開URL"
              value={formData.publicUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, publicUrl: e.target.value })
              }
              placeholder="/path/to/content"
              disabled={isLoading}
            />

            <Grid2 container spacing={2}>
              <Grid2 xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>言語</InputLabel>
                  <Select
                    value={formData.lang}
                    label="言語"
                    onChange={(e) =>
                      setFormData({ ...formData, lang: e.target.value })
                    }
                    disabled={isLoading}
                  >
                    <MenuItem value="ja">日本語 (ja)</MenuItem>
                    <MenuItem value="en">English (en)</MenuItem>
                    <MenuItem value="zh">中文 (zh)</MenuItem>
                    <MenuItem value="ko">한국어 (ko)</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    value={formData.status}
                    label="ステータス"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "draft"
                          | "published"
                          | "archived",
                      })
                    }
                    disabled={isLoading}
                  >
                    <MenuItem value="draft">下書き</MenuItem>
                    <MenuItem value="published">公開</MenuItem>
                    <MenuItem value="archived">アーカイブ</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>

            <FormControl fullWidth>
              <InputLabel>可視性</InputLabel>
              <Select
                value={formData.visibility}
                label="可視性"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as
                      | "public"
                      | "unlisted"
                      | "private"
                      | "draft",
                  })
                }
                disabled={isLoading}
              >
                <MenuItem value="public">公開</MenuItem>
                <MenuItem value="unlisted">非公開（URLで共有可）</MenuItem>
                <MenuItem value="private">プライベート</MenuItem>
                <MenuItem value="draft">下書き</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                タグ
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="タグを入力..."
                  disabled={isLoading}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={addTag}
                  disabled={isLoading}
                >
                  +
                </Button>
              </Box>
              {formData.tags && formData.tags.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      disabled={isLoading}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="メタタイトル"
              value={seoFields.metaTitle}
              onChange={(e) =>
                setSeoFields({ ...seoFields, metaTitle: e.target.value })
              }
              placeholder="SEO用のタイトル"
              disabled={isLoading}
            />

            <TextField
              label="メタディスクリプション"
              multiline
              rows={3}
              value={seoFields.metaDescription}
              onChange={(e) =>
                setSeoFields({
                  ...seoFields,
                  metaDescription: e.target.value,
                })
              }
              placeholder="SEO用の説明文（150-160文字推奨）"
              disabled={isLoading}
            />

            <Divider />

            <TextField
              label="OG:Title"
              value={seoFields.ogTitle}
              onChange={(e) =>
                setSeoFields({ ...seoFields, ogTitle: e.target.value })
              }
              placeholder="SNSシェア用のタイトル"
              disabled={isLoading}
            />

            <TextField
              label="OG:Description"
              multiline
              rows={3}
              value={seoFields.ogDescription}
              onChange={(e) =>
                setSeoFields({ ...seoFields, ogDescription: e.target.value })
              }
              placeholder="SNSシェア用の説明文"
              disabled={isLoading}
            />

            <TextField
              label="OG:Image URL"
              value={seoFields.ogImage}
              onChange={(e) =>
                setSeoFields({ ...seoFields, ogImage: e.target.value })
              }
              placeholder="/images/og-image.jpg"
              disabled={isLoading}
            />

            <Divider />

            <TextField
              label="カノニカルURL"
              value={seoFields.canonical}
              onChange={(e) =>
                setSeoFields({ ...seoFields, canonical: e.target.value })
              }
              placeholder="https://example.com/canonical-url"
              disabled={isLoading}
            />
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="親コンテンツID"
              value={formData.parentId || ""}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              placeholder="parent-content-id"
              disabled={isLoading}
              helperText="階層構造を持たせる場合に親コンテンツのIDを指定"
            />

            <TextField
              label="パス"
              value={formData.path || ""}
              onChange={(e) =>
                setFormData({ ...formData, path: e.target.value })
              }
              placeholder="/category/subcategory"
              disabled={isLoading}
            />

            <Grid2 container spacing={2}>
              <Grid2 xs={12} sm={6}>
                <TextField
                  label="階層の深さ"
                  type="number"
                  fullWidth
                  value={formData.depth || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depth: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  inputProps={{ min: 0 }}
                  disabled={isLoading}
                />
              </Grid2>

              <Grid2 xs={12} sm={6}>
                <TextField
                  label="表示順序"
                  type="number"
                  fullWidth
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  disabled={isLoading}
                />
              </Grid2>
            </Grid2>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              多言語対応の設定を行います
            </Typography>
            <TextField
              label="デフォルト言語"
              value={formData.i18n?.defaultLang || formData.lang || "ja"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  i18n: {
                    ...formData.i18n,
                    defaultLang: e.target.value,
                  },
                })
              }
              placeholder="ja"
              disabled={isLoading}
            />
            <TextField
              label="翻訳マップ（JSON）"
              multiline
              rows={4}
              value={JSON.stringify(formData.i18n?.translations || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      defaultLang:
                        formData.i18n?.defaultLang || formData.lang || "ja",
                      translations: parsed,
                    },
                  });
                } catch {
                  // Invalid JSON - ignore
                }
              }}
              placeholder='{"en": "content-en-001", "zh": "content-zh-001"}'
              disabled={isLoading}
              helperText="言語コードと翻訳先コンテンツIDのマッピング"
              sx={{ fontFamily: "monospace" }}
            />
          </Box>
        )}

        {activeTab === 4 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  アクセス制御
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="オーナー"
                    value={formData.permissions?.owner || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          owner: e.target.value,
                        },
                      })
                    }
                    placeholder="user-id"
                    disabled={isLoading}
                  />
                  <TextField
                    label="読み取り権限（カンマ区切り）"
                    value={formData.permissions?.readers?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          readers: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="user1, user2, user3"
                    disabled={isLoading}
                  />
                  <TextField
                    label="編集権限（カンマ区切り）"
                    value={formData.permissions?.editors?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          editors: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="editor1, editor2"
                    disabled={isLoading}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  バージョニング
                </Typography>
                <TextField
                  label="バージョン番号"
                  type="number"
                  fullWidth
                  value={formData.version || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      version: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  inputProps={{ min: 1 }}
                  disabled={isLoading}
                  helperText="現在のバージョン番号（編集のたびに自動増加）"
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  拡張フィールド（JSON）
                </Typography>
                <TextField
                  label="カスタムデータ（JSON形式）"
                  multiline
                  rows={6}
                  fullWidth
                  value={JSON.stringify(formData.ext || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, ext: parsed });
                    } catch {
                      // Invalid JSON - ignore
                    }
                  }}
                  placeholder='{"customField": "value"}'
                  disabled={isLoading}
                  helperText="プロジェクト固有のカスタムフィールドをJSON形式で追加できます"
                  sx={{ fontFamily: "monospace" }}
                />
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? "保存中..." : mode === "create" ? "作成" : "保存"}
        </Button>
      </Box>
    </Box>
  );
}
