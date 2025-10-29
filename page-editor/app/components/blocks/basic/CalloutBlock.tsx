"use client";

import { Box } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

const CALLOUT_STYLES: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  NOTE: { border: "#3b82f6", bg: "rgba(59,130,246,0.08)", text: "#cfe0ff" },
  WARNING: { border: "#f59e0b", bg: "rgba(245,158,11,0.1)", text: "#ffe2b0" },
  CALLOUT: { border: "#8b5cf6", bg: "rgba(139,92,246,0.1)", text: "#e0d4ff" },
  TIP: { border: "#22c55e", bg: "rgba(34,197,94,0.1)", text: "#c9f7d9" },
  CAUTION: { border: "#f97316", bg: "rgba(249,115,22,0.1)", text: "#ffd6bd" },
  IMPORTANT: { border: "#ef4444", bg: "rgba(239,68,68,0.1)", text: "#ffcccc" },
};

export function CalloutBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange: _onAttributesChange,
  autoFocus,
  onKeyDown,
}: BlockComponentProps) {
  const rawFirstLine = (block.content ?? "").split(/\r?\n/)[0] ?? "";
  const match = rawFirstLine.match(
    /^\s*\[!(NOTE|WARNING|CALLOUT|TIP|CAUTION|IMPORTANT)\]/i,
  );
  const kind = match ? match[1].toUpperCase() : "NOTE";
  const tone = CALLOUT_STYLES[kind] ?? CALLOUT_STYLES.NOTE;

  return (
    <Box
      sx={{
        borderLeft: `4px solid ${tone.border}`,
        pl: 2,
        py: 1.25,
        bgcolor: tone.bg,
        color: tone.text,
      }}
    >
      <EditableText
        value={block.content}
        onChange={onContentChange}
        readOnly={readOnly}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        placeholder="> [!NOTE] Callout"
        sx={{
          typography: "body1",
          backgroundColor: "transparent",
          border: "none",
          paddingX: 0,
          paddingY: 0.5,
          whiteSpace: "pre-wrap",
          "&:focus": { border: "none", backgroundColor: "transparent" },
        }}
      />
    </Box>
  );
}
