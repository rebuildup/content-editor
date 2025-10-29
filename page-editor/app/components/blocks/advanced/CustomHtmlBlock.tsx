"use client";

import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

type ViewMode = "edit" | "preview";

export function CustomHtmlBlock({
  block,
  readOnly,
  onContentChange,
  autoFocus,
  onKeyDown,
}: BlockComponentProps) {
  const [mode, setMode] = useState<ViewMode>(() => {
    if (readOnly) {
      return "preview";
    }
    return block.content?.trim() ? "preview" : "edit";
  });

  const sanitizedHtml = useMemo(
    () => (block.content ?? "").trim(),
    [block.content],
  );
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (readOnly) {
      setMode("preview");
    }
  }, [readOnly]);

  const handleModeChange = useCallback((_: unknown, next: ViewMode | null) => {
    if (!next) {
      return;
    }
    setMode(next);
  }, []);

  useEffect(() => {
    if (!previewRef.current || (mode !== "preview" && !readOnly)) {
      return;
    }

    const scripts = Array.from(
      previewRef.current.querySelectorAll("script"),
    ) as HTMLScriptElement[];

    scripts.forEach((script) => {
      const replacement = document.createElement("script");
      Array.from(script.attributes).forEach((attr) => {
        replacement.setAttribute(attr.name, attr.value);
      });
      replacement.textContent = script.textContent;
      script.replaceWith(replacement);
    });
  }, [mode, readOnly]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <CardHeader
        title="Custom HTML"
        subheader="Paste raw HTML and preview instantly."
        sx={{ "& .MuiCardHeader-subheader": { color: "text.secondary" } }}
        action={
          !readOnly && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={handleModeChange}
            >
              <ToggleButton value="edit" aria-label="Edit HTML">
                <CodeRoundedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="preview" aria-label="Preview HTML">
                <PreviewRoundedIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Alert severity="warning" variant="outlined">
            HTML embeds render live inside the editor. Only paste HTML from
            trusted sources. Scripts are executed as-is.
          </Alert>
          {mode === "preview" || readOnly ? (
            <Box
              sx={{
                borderRadius: 2,
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                backgroundColor: "rgba(255,255,255,0.04)",
                minHeight: 140,
                p: 2,
                overflow: "auto",
              }}
            >
              {sanitizedHtml ? (
                <Box
                  ref={previewRef}
                  component="div"
                  sx={{
                    "& iframe": {
                      maxWidth: "100%",
                    },
                  }}
                  /* biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized and intentionally rendered HTML */
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nothing to preview yet. Switch back to edit mode to add HTML.
                </Typography>
              )}
            </Box>
          ) : (
            <EditableText
              value={block.content}
              onChange={onContentChange}
              autoFocus={autoFocus}
              readOnly={readOnly}
              onKeyDown={onKeyDown}
              placeholder="<div>Hello world</div>"
              sx={{
                typography: "body2",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                backgroundColor: "rgba(15,23,42,0.4)",
                borderRadius: 2,
                minHeight: 160,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                whiteSpace: "pre-wrap",
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
