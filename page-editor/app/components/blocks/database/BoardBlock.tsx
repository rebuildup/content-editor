"use client";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { Paper, Stack, Typography } from "@mui/material";
import type { BlockComponentProps } from "../types";

export function BoardBlock({ block }: BlockComponentProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2.5,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <DashboardRoundedIcon color="primary" />
          <Typography variant="subtitle2">Board block</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {block.content || "Kanban board placeholder."}
        </Typography>
      </Stack>
    </Paper>
  );
}
