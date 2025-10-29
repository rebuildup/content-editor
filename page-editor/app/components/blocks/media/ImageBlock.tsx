"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { EditableText } from "@/app/components/editor/EditableText";
import { getMediaUrl, uploadMediaFile } from "@/lib/api/media";
import { formatFileSize } from "@/lib/utils/file-upload";
import type { BlockComponentProps } from "../types";

export function ImageBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
  contentId,
}: BlockComponentProps) {
  const src = (block.attributes.src as string | undefined) ?? "";
  const alt = (block.attributes.alt as string | undefined) ?? "";
  const filename =
    (block.attributes.filename as string | undefined) ?? undefined;
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

        const result = await uploadMediaFile(contentId, file, {
          alt: alt || undefined,
          description: block.content || undefined,
        });

        const mediaUrl = getMediaUrl(contentId, result.id);
        const nextAttributes: Record<string, unknown> = {
          src: mediaUrl,
          mediaId: result.id,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        };

        if (!alt) {
          nextAttributes.alt = file.name;
        }

        onAttributesChange(nextAttributes);
      } catch (error) {
        console.error("Failed to upload image", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload image.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [alt, block.content, contentId, onAttributesChange],
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
      {src ? (
        <CardMedia
          component="img"
          height="220"
          src={src}
          alt={alt}
          sx={{ objectFit: "cover" }}
        />
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ py: 6, color: "text.secondary" }}
        >
          <ImageRoundedIcon fontSize="large" color="primary" />
          <Typography variant="body2">Paste an image URL</Typography>
        </Stack>
      )}
      <CardContent>
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
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
                {isUploading ? "Uploading..." : "Upload image"}
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
          {filename && (
            <Typography variant="caption" color="text.secondary">
              Current file: {filename}
              {typeof size === "number"
                ? ` · ${formatFileSize(size)}`
                : ""}
            </Typography>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Image URL"
              fullWidth
              value={src}
              onChange={(event) =>
                onAttributesChange({ src: event.target.value })
              }
              placeholder="https://example.com/image.png"
              disabled={readOnly}
            />
            <TextField
              label="Alt text"
              fullWidth
              value={alt}
              onChange={(event) =>
                onAttributesChange({ alt: event.target.value })
              }
              placeholder="Describe the image"
              disabled={readOnly}
            />
          </Stack>
          <EditableText
            value={block.content}
            onChange={onContentChange}
            readOnly={readOnly}
            placeholder="Caption"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
