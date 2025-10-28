"use client";

import TocRoundedIcon from "@mui/icons-material/TocRounded";
import { Paper, Stack, Typography } from "@mui/material";
import type { BlockComponentProps } from "../types";

export function TableOfContentsBlock(_: BlockComponentProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2.5,
        bgcolor: "rgba(255,255,255,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <TocRoundedIcon color="primary" />
        <Typography variant="subtitle2" fontWeight={600}>
          Table of contents
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Table of contents is generated automatically based on heading blocks.
      </Typography>
    </Paper>
  );
}
