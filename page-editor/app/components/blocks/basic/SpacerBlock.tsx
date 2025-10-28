"use client";

import { Paper, Slider, Stack, Typography } from "@mui/material";
import type { BlockComponentProps } from "../types";

export function SpacerBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const height = Number(block.attributes.height ?? 24);

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">Spacer</Typography>
          <Typography variant="caption" color="text.secondary">
            {height}px
          </Typography>
        </Stack>
        <Slider
          value={height}
          min={0}
          max={240}
          step={4}
          valueLabelDisplay="auto"
          onChange={(_, value) => {
            if (typeof value === "number") {
              onAttributesChange({ height: value });
            }
          }}
          disabled={readOnly}
        />
        <Typography
          component="div"
          sx={{
            width: "100%",
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            height,
            bgcolor: "rgba(255,255,255,0.04)",
          }}
        />
      </Stack>
    </Paper>
  );
}
