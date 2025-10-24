"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

interface MediaUploadFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  contentId?: string;
}

export function MediaUploadForm({
  onSubmit,
  onCancel,
  isLoading = false,
  contentId,
}: MediaUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedContentId, setSelectedContentId] = useState(contentId || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("ファイルを選択してください");
      return;
    }

    if (!selectedContentId) {
      alert("コンテンツIDを入力してください");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentId", selectedContentId);
    if (alt) formData.append("alt", alt);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);

    onSubmit(formData);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="コンテンツID"
          required
          value={selectedContentId}
          onChange={(e) => setSelectedContentId(e.target.value)}
          placeholder="apple01"
          disabled={isLoading}
          helperText="このメディアを関連付けるコンテンツのID"
        />

        <Divider />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            ファイル <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant="outlined"
              component="label"
              disabled={isLoading}
              sx={{ flex: 1 }}
            >
              ファイルを選択
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                hidden
              />
            </Button>
            {file && (
              <IconButton
                onClick={clearFile}
                disabled={isLoading}
                color="error"
              >
                ×
              </IconButton>
            )}
          </Box>
          {file && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              選択済み: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
          )}
        </Box>

        {previewUrl && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                プレビュー
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={256}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "16rem",
                    objectFit: "contain",
                    borderRadius: 4,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        <Divider />

        <TextField
          label="代替テキスト（Alt）"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="画像の説明"
          disabled={isLoading}
          helperText="アクセシビリティのための画像説明"
        />

        <TextField
          label="説明"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="メディアの詳細な説明"
          disabled={isLoading}
        />

        <TextField
          label="タグ（カンマ区切り）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          disabled={isLoading}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? "アップロード中..." : "アップロード"}
        </Button>
      </Box>
    </Box>
  );
}
