"use client";

import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import { Paper, Stack, Typography } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function TableBlock({
  block,
  readOnly,
  onContentChange,
}: BlockComponentProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2.5,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TableChartRoundedIcon color="primary" />
          <Typography variant="subtitle2">
            Table (Markdown-compatible)
          </Typography>
        </Stack>
        <EditableText
          value={block.content}
          onChange={onContentChange}
          readOnly={readOnly}
          placeholder="Describe the table in Markdown"
          sx={{
            fontFamily: "monospace",
            minHeight: "120px",
          }}
        />
      </Stack>
    </Paper>
  );
}
