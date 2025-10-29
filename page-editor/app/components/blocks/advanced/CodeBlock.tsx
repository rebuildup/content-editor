"use client";

import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import {
  Box,
  IconButton,
  MenuItem,
  Paper,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Prism from "prismjs";
import { useEffect, useMemo, useState } from "react";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

type ViewMode = "edit" | "preview" | "split";

export function CodeBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const language = (block.attributes.language as string | undefined) ?? "";
  const aliasMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    sh: "bash",
    zsh: "bash",
    shell: "bash",
    py: "python",
    yml: "yaml",
    md: "markdown",
    html: "markup",
    xml: "markup",
    txt: "plaintext",
  };

  const normalizedLang = useMemo(() => {
    const input = (language || "").trim().toLowerCase();
    const preferred = input ? (aliasMap[input] ?? input) : "plaintext";
    return preferred || "plaintext";
  }, [language]);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = (block.attributes.viewMode as string | undefined) ?? "split";
    return saved === "edit" || saved === "preview" || saved === "split"
      ? saved
      : "split";
  });
  const handleChangeView = (_: unknown, next: ViewMode | null) => {
    if (!next) return;
    setViewMode(next);
    onAttributesChange({ viewMode: next });
  };

  useEffect(() => {
    let mounted = true;
    const name = normalizedLang.replace(/[^a-z0-9-]/g, "");
    if (!name || name === "plaintext") return;
    const load = async () => {
      try {
        await import(
          `prismjs/components/prism-${name}.js` as unknown as string
        );
      } catch {
        // ignore missing language
      } finally {
        if (mounted) {
          // trigger highlight on next tick
          requestAnimationFrame(() => {
            Prism.highlightAllUnder?.(document.body);
          });
        }
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [normalizedLang]);

  const highlightedHtml = useMemo(() => {
    const code = block.content || "";
    const grammar =
      Prism.languages[normalizedLang] ||
      Prism.languages.markup ||
      (Prism.languages as unknown as Record<string, unknown>).plaintext;
    try {
      return Prism.highlight(code, grammar as unknown, normalizedLang);
    } catch {
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [block.content, normalizedLang]);

  // 自動設定は行わない（ユーザー選択を尊重）

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.content || "");
    } catch { }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        bgcolor: "transparent",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        p: 0,
        position: "relative",
        "&:hover .codeblock-controls, & .codeblock-controls:focus-within": {
          opacity: 1,
          pointerEvents: "auto",
        },
      }}
    >
      {!readOnly && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 1,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 120ms ease",
            zIndex: 3,
          }}
          className="codeblock-controls"
        >
          <Select
            size="small"
            value={language || ""}
            onChange={(event) =>
              onAttributesChange({ language: String(event.target.value) })
            }
            displayEmpty
            sx={{
              minWidth: 140,
              bgcolor: "rgba(0,0,0,0.4)",
              borderRadius: 1,
              color: "#fff",
              "& .MuiSelect-icon": { color: "#fff" },
              boxShadow: 1,
              zIndex: 3,
            }}
          >
            <MenuItem value="">
              <em>auto (plain)</em>
            </MenuItem>
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="typescript">TypeScript</MenuItem>
            <MenuItem value="tsx">TSX</MenuItem>
            <MenuItem value="jsx">JSX</MenuItem>
            <MenuItem value="bash">Bash</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="c">C</MenuItem>
            <MenuItem value="ruby">Ruby</MenuItem>
            <MenuItem value="php">PHP</MenuItem>
            <MenuItem value="go">Go</MenuItem>
            <MenuItem value="rust">Rust</MenuItem>
            <MenuItem value="kotlin">Kotlin</MenuItem>
            <MenuItem value="swift">Swift</MenuItem>
            <MenuItem value="sql">SQL</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="yaml">YAML</MenuItem>
            <MenuItem value="markdown">Markdown</MenuItem>
            <MenuItem value="markup">HTML/XML</MenuItem>
            <MenuItem value="css">CSS</MenuItem>
            <MenuItem value="scss">SCSS</MenuItem>
          </Select>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={handleChangeView}
            sx={{
              bgcolor: "rgba(0,0,0,0.4)",
              borderRadius: 1,
              ml: 1,
              color: "#fff",
              "& .MuiToggleButton-root": { color: "#fff", px: 1 },
            }}
          >
            <ToggleButton value="edit" aria-label="Edit">
              E
            </ToggleButton>
            <ToggleButton value="split" aria-label="Split">
              S
            </ToggleButton>
            <ToggleButton value="preview" aria-label="Preview">
              P
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton
            size="small"
            onClick={() => void handleCopy()}
            sx={{
              bgcolor: "rgba(0,0,0,0.4)",
              borderRadius: 1,
              color: "#fff",
              "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
            }}
          >
            <ContentCopyRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Box
        sx={{
          position: "relative",
          p: 2,
        }}
      >
        {readOnly || viewMode === "preview" ? (
          <pre
            className={`language-${normalizedLang}`}
            style={{
              margin: 0,
              background: "transparent",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 12,
            }}
          >
            <code
              className={`language-${normalizedLang}`}
              /* biome-ignore lint/security/noDangerouslySetInnerHtml: Code is highlighted by Prism or escaped; trusted source */
              dangerouslySetInnerHTML={{
                __html: highlightedHtml,
              }}
            />
          </pre>
        ) : viewMode === "edit" ? (
          <EditableText
            value={block.content}
            onChange={onContentChange}
            readOnly={readOnly}
            placeholder="// Write code here"
            sx={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "#e5e7eb",
              backgroundColor: "transparent",
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              padding: 1.5,
              minHeight: 140,
              whiteSpace: "pre",
              overflowX: "auto",
            }}
          />
        ) : (
          <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <EditableText
                value={block.content}
                onChange={onContentChange}
                readOnly={readOnly}
                placeholder="// Write code here"
                sx={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "#e5e7eb",
                  backgroundColor: "transparent",
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  padding: 1.5,
                  minHeight: 140,
                  whiteSpace: "pre",
                  overflowX: "auto",
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <pre
                className={`language-${normalizedLang}`}
                style={{
                  margin: 0,
                  background: "transparent",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 12,
                }}
              >
                <code
                  className={`language-${normalizedLang}`}
                  /* biome-ignore lint/security/noDangerouslySetInnerHtml: Code is highlighted by Prism or escaped; trusted source */
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </pre>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
