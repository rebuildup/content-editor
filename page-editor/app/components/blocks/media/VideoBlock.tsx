"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import MovieCreationRoundedIcon from "@mui/icons-material/MovieCreationRounded";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { getMediaUrl, uploadMediaFile } from "@/lib/api/media";
import { formatFileSize } from "@/lib/utils/file-upload";
import type { BlockComponentProps } from "../types";

export function VideoBlock({
  block,
  readOnly,
  onAttributesChange,
  contentId,
}: BlockComponentProps) {
  const src = (block.attributes.src as string | undefined) ?? "";
  const poster = (block.attributes.poster as string | undefined) ?? "";
  const autoplay = Boolean(block.attributes.autoplay);
  const controls = block.attributes.controls !== false;
  const filename =
    (block.attributes.filename as string | undefined) ?? undefined;
  const size = block.attributes.size as number | undefined;
  const widthPercent = Number(block.attributes.widthPercent ?? 100);
  const heightPx =
    block.attributes.heightPx === undefined
      ? undefined
      : Math.max(0, Number(block.attributes.heightPx));
  const align = (block.attributes.align as string | undefined) ?? "left";
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
        console.error("Failed to upload video", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload video.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [contentId, onAttributesChange],
  );

  const alignToText =
    align === "center" ? "center" : align === "right" ? "right" : "left";
  const boxWidth = Math.max(
    0,
    Math.min(100, Number.isNaN(widthPercent) ? 100 : widthPercent),
  );

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        p: 0,
        "&:hover .video-controls": { opacity: 1, pointerEvents: "auto" },
      }}
    >
      <Box sx={{ textAlign: alignToText, px: 0 }}>
        {src ? (
          <Box
            component="video"
            src={src}
            poster={poster || undefined}
            controls={controls}
            autoPlay={autoplay}
            muted
            sx={{
              display: "inline-block",
              width: `${boxWidth}%`,
              height: heightPx ? `${heightPx}px` : "auto",
              objectFit: heightPx ? "cover" : "contain",
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ py: 6, color: "text.secondary" }}
          >
            <MovieCreationRoundedIcon fontSize="large" color="primary" />
            <Typography variant="body2">Paste a video URL</Typography>
          </Stack>
        )}
      </Box>

      {/* Top: style controls */}
      {!readOnly && (
        <>
          <Box
            className="video-controls"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.35)",
              borderRadius: 1,
              p: 1,
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 120ms ease",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                label="Width (%)"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 140 }}
                value={boxWidth}
                onChange={(e) =>
                  onAttributesChange({
                    widthPercent: Math.max(
                      0,
                      Math.min(100, Number(e.target.value ?? 100)),
                    ),
                  })
                }
              />
              <TextField
                label="Height (px)"
                type="number"
                inputProps={{ min: 0, max: 4000 }}
                sx={{ width: 160 }}
                value={heightPx ?? ""}
                onChange={(e) => {
                  const v =
                    e.target.value === ""
                      ? undefined
                      : Math.max(0, Math.min(4000, Number(e.target.value)));
                  onAttributesChange({ heightPx: v });
                }}
              />
              <Select
                size="small"
                value={align}
                onChange={(e) => onAttributesChange({ align: e.target.value })}
                sx={{ width: 140 }}
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </Select>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoplay}
                    onChange={(e) =>
                      onAttributesChange({ autoplay: e.target.checked })
                    }
                  />
                }
                label="Autoplay"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={controls}
                    onChange={(e) =>
                      onAttributesChange({ controls: e.target.checked })
                    }
                  />
                }
                label="Controls"
              />
            </Stack>
          </Box>

          {/* Bottom: meta + upload in 3 rows */}
          <Box
            className="video-controls"
            sx={{
              position: "absolute",
              top: 56,
              left: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.35)",
              borderRadius: 1,
              p: 1,
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 120ms ease",
            }}
          >
            {/* Row 1: Upload full width */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadRoundedIcon />}
                component="label"
                disabled={!contentId || isUploading}
                sx={{ whiteSpace: "nowrap" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleFileChange}
                />
                {isUploading ? "Uploading..." : "Upload video"}
              </Button>
            </Stack>
            {uploadError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {uploadError}
              </Alert>
            )}
            {filename && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Current file: {filename}
                {typeof size === "number" ? ` · ${formatFileSize(size)}` : ""}
              </Typography>
            )}

            {/* Row 2: URL + Poster */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              <TextField
                label="URL"
                fullWidth
                value={src}
                onChange={(e) => onAttributesChange({ src: e.target.value })}
                placeholder="https://.../video.mp4"
              />
              <TextField
                label="Poster"
                fullWidth
                value={poster}
                onChange={(e) => onAttributesChange({ poster: e.target.value })}
                placeholder="https://.../thumb.jpg"
              />
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}
