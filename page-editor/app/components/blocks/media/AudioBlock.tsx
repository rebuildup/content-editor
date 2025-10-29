"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
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
    <Box
      sx={{
        position: "relative",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 1,
        bgcolor: "rgba(255,255,255,0.02)",
        transition: "padding-top 120ms ease",
        "&:hover .audio-controls": { opacity: 1, pointerEvents: "auto" },
        "&:hover .audio-preview": { mt: 28 },
      }}
    >
      {/* Top controls overlay (appears on hover) */}
      {!readOnly && (
        <Box
          className="audio-controls"
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
          <Stack spacing={1.5}>
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
                  accept="audio/*"
                  hidden
                  onChange={handleFileChange}
                />
                {isUploading ? "Uploading..." : "Upload audio"}
              </Button>
            </Stack>
            {uploadError && <Alert severity="error">{uploadError}</Alert>}
            {filename && (
              <Typography variant="caption" color="text.secondary">
                Current file: {filename}
                {typeof size === "number" ? ` · ${formatFileSize(size)}` : ""}
              </Typography>
            )}

            {/* Row 2: URL */}
            <TextField
              label="Audio URL"
              fullWidth
              value={src}
              onChange={(e) => onAttributesChange({ src: e.target.value })}
              placeholder="https://example.com/audio.mp3"
            />

            {/* Row 3: toggles */}
            <Stack direction="row" spacing={2} alignItems="center">
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
          </Stack>
        </Box>
      )}

      {/* Preview area (moves down on hover to avoid overlap) */}
      <Box className="audio-preview" sx={{ transition: "margin 120ms ease" }}>
        {src ? (
          <audio
            src={src}
            controls={controls}
            autoPlay={autoplay}
            style={{ width: "100%" }}
          >
            <track kind="captions" />
          </audio>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ py: 4, color: "text.secondary" }}
          >
            <GraphicEqRoundedIcon color="primary" />
            <Typography variant="body2">Paste an audio URL</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
