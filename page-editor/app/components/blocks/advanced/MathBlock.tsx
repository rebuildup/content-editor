"use client";

import FunctionsRoundedIcon from "@mui/icons-material/FunctionsRounded";
import { Paper, Stack, Typography } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function MathBlock({
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
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FunctionsRoundedIcon color="primary" />
          <Typography variant="subtitle2">TeX Expression</Typography>
        </Stack>
        <EditableText
          value={block.content}
          onChange={onContentChange}
          readOnly={readOnly}
          placeholder="Enter TeX expression"
          sx={{
            fontFamily: "monospace",
            minHeight: "96px",
          }}
        />
      </Stack>
    </Paper>
  );
}
