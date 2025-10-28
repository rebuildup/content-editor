"use client";

import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { Paper, Stack, TextField, Typography } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function CodeBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const language = (block.attributes.language as string | undefined) ?? "";

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        bgcolor: "rgba(12,18,32,0.9)",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        p: 2.5,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CodeRoundedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2">Code block</Typography>
          <TextField
            size="small"
            variant="outlined"
            label="Language"
            value={language}
            onChange={(event) =>
              onAttributesChange({ language: event.target.value })
            }
            disabled={readOnly}
            placeholder="e.g. typescript"
            sx={{ maxWidth: 200, ml: "auto" }}
          />
        </Stack>
        <EditableText
          value={block.content}
          onChange={onContentChange}
          readOnly={readOnly}
          placeholder="Code"
          sx={{
            fontFamily: "monospace",
            fontSize: 14,
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            padding: 2,
            minHeight: "140px",
          }}
        />
      </Stack>
    </Paper>
  );
}
