"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
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
    <Box
      sx={{
        position: "relative",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 1,
        bgcolor: "rgba(255,255,255,0.02)",
        "&:hover .file-controls": { opacity: 1, pointerEvents: "auto" },
        "&:hover .file-preview": { mt: 14 },
      }}
    >
      {/* Preview: bookmark-like card */}
      <Box className="file-preview" sx={{ transition: "margin 120ms ease" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.25,
            borderRadius: 1.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: "rgba(255,255,255,0.03)",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(59,130,246,0.15)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <DescriptionRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{
                  display: "block",
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name || url}
              </Link>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Upload a file or paste a URL
              </Typography>
            )}
            {typeof size === "number" && (
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(size)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Controls overlay (top) */}
      {!readOnly && (
        <Box
          className="file-controls"
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
          {/* Row 1: Upload (full width) */}
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
                hidden
                onChange={handleFileChange}
              />
              {isUploading ? "Uploading..." : "Upload file"}
            </Button>
          </Stack>
          {uploadError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {uploadError}
            </Alert>
          )}

          {/* Row 2: Name + URL */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mt: 1.5 }}
          >
            <TextField
              label="File name"
              fullWidth
              value={name}
              onChange={(e) => onAttributesChange({ filename: e.target.value })}
            />
            <TextField
              label="URL"
              fullWidth
              value={url}
              onChange={(e) => onAttributesChange({ src: e.target.value })}
              placeholder="https://example.com/file.pdf"
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
}
