"use client";

import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import type { BlockComponentProps } from "../types";

type MediaKind = "image" | "video" | "audio" | "file";

interface ParsedItem {
  kind: MediaKind;
  url: string;
  label?: string;
}

function parseGalleryContent(text: string): ParsedItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const items: ParsedItem[] = [];

  for (const line of lines) {
    // Format 1: [image] https://...
    const m1 = line.match(/^\[(image|video|audio|file)\]\s+(.+)$/i);
    if (m1) {
      items.push({ kind: m1[1].toLowerCase() as MediaKind, url: m1[2] });
      continue;
    }

    // Format 2: label | kind | url
    const m2 = line.match(
      /^([^|]+)\|\s*(image|video|audio|file)\s*\|\s*(.+)$/i,
    );
    if (m2) {
      items.push({
        kind: m2[2].toLowerCase() as MediaKind,
        url: m2[3],
        label: m2[1].trim(),
      });
      continue;
    }

    // Fallback: infer from extension
    const lower = line.toLowerCase();
    if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp)(\?.*)?$/.test(lower)) {
      items.push({ kind: "image", url: line });
    } else if (/(\.mp4|\.webm|\.mov)(\?.*)?$/.test(lower)) {
      items.push({ kind: "video", url: line });
    } else if (/(\.mp3|\.wav|\.ogg)(\?.*)?$/.test(lower)) {
      items.push({ kind: "audio", url: line });
    } else {
      items.push({ kind: "file", url: line });
    }
  }

  return items;
}

export function GalleryBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const items = useMemo(
    () => parseGalleryContent(block.content ?? ""),
    [block.content],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [addHovered, setAddHovered] = useState(false);
  const columns = Number(block.attributes.columns ?? 3);
  const maxRows = Number(block.attributes.maxRows ?? 0); // 0: no limit
  // use 12 columns on md breakpoint for layout calculations

  const visibleCount = useMemo(() => {
    if (!maxRows || maxRows <= 0) return items.length;
    const totalMd = 12;
    const colPerItemMd = Math.floor(totalMd / columns) || 3; // each tile span
    const perRow = Math.floor(totalMd / colPerItemMd) || columns;
    return Math.min(items.length, perRow * maxRows);
  }, [items.length, maxRows, columns]);

  return (
    <Stack spacing={1.5}>
      {/* wrapper that expands on hover to reveal controls */}
      <Box
        sx={{
          position: "relative",
          pb: 0,
          transition: "padding-bottom 150ms ease",
          "&:hover": { pb: 14 },
        }}
      >
        {/* tiles */}
        <Grid container spacing={1.5}>
          {/* Add tile */}
          {!readOnly && (
            <Grid item xs={1} sm={2} md={3}>
              <Box
                onMouseEnter={() => setAddHovered(true)}
                onMouseLeave={() => setAddHovered(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: (theme) => `1px dashed ${theme.palette.primary.main}`,
                  bgcolor: "rgba(59,130,246,0.06)",
                  color: "primary.main",
                  borderRadius: 1.5,
                  aspectRatio: "1 / 1",
                  minHeight: 160,
                  cursor: "pointer",
                }}
              >
                <Typography variant="body2">+ Add media</Typography>
              </Box>
            </Grid>
          )}
          {items.slice(0, visibleCount).map((item, idx) => (
            <Grid
              key={`${item.kind}-${idx}`}
              item
              xs={6}
              sm={Math.floor(12 / columns)}
              md={Math.floor(12 / columns)}
            >
              <Box
                onClick={() => setSelected(idx)}
                sx={{
                  border: (theme) =>
                    `1px solid ${selected === idx ? theme.palette.primary.main : theme.palette.divider}`,
                  boxShadow:
                    selected === idx
                      ? (theme) =>
                          `0 0 0 2px ${theme.palette.primary.main}33 inset`
                      : undefined,
                  cursor: "pointer",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.03)",
                }}
              >
                {item.kind === "image" && (
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.label ?? ""}
                    sx={{
                      display: "block",
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                    }}
                  />
                )}
                {item.kind === "video" && (
                  <Box
                    component="video"
                    src={item.url}
                    controls
                    sx={{
                      display: "block",
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                    }}
                  />
                )}
                {item.kind === "audio" && (
                  <Box sx={{ p: 1 }}>
                    <audio src={item.url} controls style={{ width: "100%" }}>
                      <track kind="captions" />
                    </audio>
                  </Box>
                )}
                {item.kind === "file" && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      File
                    </Typography>
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      underline="hover"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label ?? item.url}
                    </Link>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* hover controls overlay (bottom): item controls or gallery settings */}
        <Box
          className="gallery-controls"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 120ms ease",
          }}
        >
          <Box
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              p: 1,
              bgcolor: "rgba(0,0,0,0.35)",
            }}
          >
            <Stack spacing={1.5}>
              {/* Add media (shown when hovering add tile) */}
              {!readOnly && addHovered && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[image] `,
                      );
                      setSelected(items.length);
                    }}
                  >
                    Image
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[video] `,
                      );
                      setSelected(items.length);
                    }}
                  >
                    Video
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[audio] `,
                      );
                      setSelected(items.length);
                    }}
                  >
                    Audio
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[file] `,
                      );
                      setSelected(items.length);
                    }}
                  >
                    File
                  </Button>
                </Stack>
              )}
              {/* Gallery settings */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <TextField
                  label="Columns"
                  type="number"
                  inputProps={{ min: 1, max: 6 }}
                  sx={{ width: 140 }}
                  value={columns}
                  onChange={(e) =>
                    onAttributesChange?.({
                      columns: Math.max(
                        1,
                        Math.min(6, Number(e.target.value ?? 3)),
                      ),
                    })
                  }
                />
                <TextField
                  label="Max rows"
                  type="number"
                  inputProps={{ min: 0, max: 20 }}
                  sx={{ width: 140 }}
                  value={maxRows}
                  onChange={(e) =>
                    onAttributesChange?.({
                      maxRows: Math.max(
                        0,
                        Math.min(20, Number(e.target.value ?? 0)),
                      ),
                    })
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[image] `,
                      )
                    }
                    disabled={readOnly}
                  >
                    + Image
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[video] `,
                      )
                    }
                    disabled={readOnly}
                  >
                    + Video
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[audio] `,
                      )
                    }
                    disabled={readOnly}
                  >
                    + Audio
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      onContentChange?.(
                        `${block.content ? `${block.content}\n` : ""}[file] `,
                      )
                    }
                    disabled={readOnly}
                  >
                    + File
                  </Button>
                </Stack>
              </Stack>

              {/* Selected tile controls */}
              {selected !== null && items[selected] && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  {items[selected].kind === "image" && (
                    <>
                      <TextField
                        label="URL"
                        fullWidth
                        defaultValue={items[selected].url}
                        onBlur={(e) => {
                          if (selected === null) return;
                          const lines = (block.content ?? "").split(/\r?\n/);
                          lines[selected] = `[image] ${e.target.value}`;
                          onContentChange?.(lines.join("\n"));
                        }}
                      />
                      <TextField
                        label="Alt (label)"
                        fullWidth
                        defaultValue={items[selected].label ?? ""}
                        onBlur={(e) => {
                          if (selected === null) return;
                          const lines = (block.content ?? "").split(/\r?\n/);
                          lines[selected] =
                            `${e.target.value || items[selected].url} | image | ${items[selected].url}`;
                          onContentChange?.(lines.join("\n"));
                        }}
                      />
                    </>
                  )}
                  {items[selected].kind === "video" && (
                    <TextField
                      label="URL"
                      fullWidth
                      defaultValue={items[selected].url}
                      onBlur={(e) => {
                        if (selected === null) return;
                        const lines = (block.content ?? "").split(/\r?\n/);
                        lines[selected] = `[video] ${e.target.value}`;
                        onContentChange?.(lines.join("\n"));
                      }}
                    />
                  )}
                  {items[selected].kind === "audio" && (
                    <TextField
                      label="URL"
                      fullWidth
                      defaultValue={items[selected].url}
                      onBlur={(e) => {
                        if (selected === null) return;
                        const lines = (block.content ?? "").split(/\r?\n/);
                        lines[selected] = `[audio] ${e.target.value}`;
                        onContentChange?.(lines.join("\n"));
                      }}
                    />
                  )}
                  {items[selected].kind === "file" && (
                    <>
                      <TextField
                        label="Name"
                        fullWidth
                        defaultValue={items[selected].label ?? ""}
                        onBlur={(e) => {
                          if (selected === null) return;
                          const lines = (block.content ?? "").split(/\r?\n/);
                          lines[selected] =
                            `${e.target.value || items[selected].url} | file | ${items[selected].url}`;
                          onContentChange?.(lines.join("\n"));
                        }}
                      />
                      <TextField
                        label="URL"
                        fullWidth
                        defaultValue={items[selected].url}
                        onBlur={(e) => {
                          if (selected === null) return;
                          const lines = (block.content ?? "").split(/\r?\n/);
                          lines[selected] =
                            `${items[selected].label ?? ""} | file | ${e.target.value}`.trim();
                          onContentChange?.(lines.join("\n"));
                        }}
                      />
                    </>
                  )}
                </Stack>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
