"use client";

import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import { Paper, Stack, TextField, Typography } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function QuoteBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const citation = (block.attributes.citation as string | undefined) ?? "";

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
        p: 3,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <FormatQuoteRoundedIcon color="primary" />
          <EditableText
            value={block.content}
            onChange={onContentChange}
            readOnly={readOnly}
            placeholder="Quote text"
            sx={{
              typography: "h6",
              fontStyle: "italic",
              color: "text.primary",
              backgroundColor: "transparent",
              border: "none",
            }}
          />
        </Stack>
        <TextField
          size="small"
          variant="outlined"
          label="Citation"
          value={citation}
          onChange={(event) =>
            onAttributesChange({ citation: event.target.value })
          }
          disabled={readOnly}
        />
        <Typography variant="caption" color="text.secondary">
          Use block quotes to highlight testimonial or contextual notes.
        </Typography>
      </Stack>
    </Paper>
  );
}
