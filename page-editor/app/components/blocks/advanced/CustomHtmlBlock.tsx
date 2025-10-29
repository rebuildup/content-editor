"use client";

import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import { Box, Card, CardContent, ToggleButton, ToggleButtonGroup } from "@mui/material";
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
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            position: "relative",
            "&:hover .custom-html-controls, & .custom-html-controls:focus-within": {
              opacity: 1,
              pointerEvents: "auto",
            },
          }}
        >
          {!readOnly && (
            <Box
              className="custom-html-controls"
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
                zIndex: 1,
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 120ms ease",
                bgcolor: "rgba(15,23,42,0.5)",
                backdropFilter: "blur(4px)",
                borderRadius: 1,
              }}
            >
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
            </Box>
          )}
          {mode === "preview" || readOnly ? (
            <Box
              sx={{
                borderRadius: 2,
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                backgroundColor: "rgba(255,255,255,0.04)",
                minHeight: 100,
                p: 1.25,
                overflow: "auto",
              }}
            >
              {sanitizedHtml && (
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
                minHeight: 140,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                whiteSpace: "pre-wrap",
                p: 1.25,
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
