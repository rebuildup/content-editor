"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { getMediaUrl, uploadMediaFile } from "@/lib/api/media";
import { formatFileSize } from "@/lib/utils/file-upload";
import type { BlockComponentProps } from "../types";

export function FileBlock({
  block,
  readOnly,
  onAttributesChange,
  contentId,
}: BlockComponentProps) {
  const url = (block.attributes.src as string | undefined) ?? "";
  const name = (block.attributes.filename as string | undefined) ?? "";
  const size = block.attributes.size as number | undefined;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (!file) {
        return;
      }
      if (!contentId) {
        setUploadError("Select a content entry before uploading media.");
        return;
      }
      try {
        setIsUploading(true);
        setUploadError(null);
        const result = await uploadMediaFile(contentId, file);
        const mediaUrl = getMediaUrl(contentId, result.id);
        onAttributesChange({
          src: mediaUrl,
          mediaId: result.id,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        });
      } catch (error) {
        console.error("Failed to upload file", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload file.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [contentId, onAttributesChange],
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <CardHeader
        avatar={<DescriptionRoundedIcon color="primary" />}
        title="File attachment"
        subheader="Upload a file or provide a downloadable link"
        sx={{ "& .MuiCardHeader-subheader": { color: "text.secondary" } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {!readOnly && (
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadRoundedIcon />}
                component="label"
                disabled={!contentId || isUploading}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
                {isUploading ? "Uploading..." : "Upload file"}
              </Button>
              {!contentId ? (
                <Alert severity="info">
                  Select a content entry to enable uploads.
                </Alert>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Uploaded files are stored inside the selected content
                  database.
                </Typography>
              )}
              {uploadError && <Alert severity="error">{uploadError}</Alert>}
            </Stack>
          )}
          <TextField
            label="File name"
            value={name}
            onChange={(event) =>
              onAttributesChange({ filename: event.target.value })
            }
            disabled={readOnly}
          />
          <TextField
            label="URL"
            value={url}
            onChange={(event) =>
              onAttributesChange({ src: event.target.value })
            }
            disabled={readOnly}
            placeholder="https://example.com/file.pdf"
          />
          {url ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Link href={url} target="_blank" rel="noreferrer">
                {name || url}
              </Link>
              {typeof size === "number" && (
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(size)}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Upload a file or paste a URL to enable the download link.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

