"use client";

import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { Paper, Stack, Typography } from "@mui/material";
import type { BlockComponentProps } from "../types";

export function CalendarBlock({ block }: BlockComponentProps) {
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
          <EventAvailableRoundedIcon color="primary" />
          <Typography variant="subtitle2">Calendar block</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {block.content || "Calendar view placeholder."}
        </Typography>
      </Stack>
    </Paper>
  );
}
