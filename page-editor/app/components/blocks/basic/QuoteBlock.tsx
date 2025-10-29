"use client";

import { Box } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function QuoteBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange: _onAttributesChange,
  autoFocus,
  onKeyDown,
}: BlockComponentProps) {
  return (
    <Box
      sx={(theme) => ({
        borderLeft: `4px solid ${theme.palette.divider}`,
        pl: 2,
        py: 1,
        color: theme.palette.text.secondary,
      })}
    >
      <EditableText
        value={block.content}
        onChange={onContentChange}
        readOnly={readOnly}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        placeholder="> Quote"
        sx={{
          typography: "body1",
          backgroundColor: "transparent",
          border: "none",
          paddingX: 0,
          paddingY: 0.5,
          "&:focus": { border: "none", backgroundColor: "transparent" },
          whiteSpace: "pre-wrap",
        }}
      />
    </Box>
  );
}
