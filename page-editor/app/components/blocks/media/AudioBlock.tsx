"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { getMediaUrl, uploadMediaFile } from "@/lib/api/media";
import { formatFileSize } from "@/lib/utils/file-upload";
import type { BlockComponentProps } from "../types";

export function AudioBlock({
  block,
  readOnly,
  onAttributesChange,
  contentId,
}: BlockComponentProps) {
  const src = (block.attributes.src as string | undefined) ?? "";
  const autoplay = Boolean(block.attributes.autoplay);
  const controls = block.attributes.controls !== false;
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
        console.error("Failed to upload audio", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload audio.",
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
        avatar={<GraphicEqRoundedIcon color="primary" />}
        title="Audio block"
        subheader="Provide an audio source URL"
        sx={{
          "& .MuiCardHeader-subheader": { color: "text.secondary" },
        }}
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
                  accept="audio/*"
                  hidden
                  onChange={handleFileChange}
                />
                {isUploading ? "Uploading..." : "Upload audio"}
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
                ? ` - ${formatFileSize(size)}`
                : ""}
            </Typography>
          )}
          <TextField
            label="Audio URL"
            fullWidth
            value={src}
            onChange={(event) =>
              onAttributesChange({ src: event.target.value })
            }
            disabled={readOnly}
            placeholder="https://example.com/audio.mp3"
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoplay}
                  onChange={(event) =>
                    onAttributesChange({ autoplay: event.target.checked })
                  }
                  disabled={readOnly}
                />
              }
              label="Autoplay"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={controls}
                  onChange={(event) =>
                    onAttributesChange({ controls: event.target.checked })
                  }
                  disabled={readOnly}
                />
              }
              label="Show controls"
            />
          </Stack>
          {src ? (
            /* biome-ignore lint/a11y/useMediaCaption: media preview in editor */
            <audio
              src={src}
              controls={controls}
              autoPlay={autoplay}
              style={{ width: "100%" }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Upload an audio file or paste a URL to enable preview.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
