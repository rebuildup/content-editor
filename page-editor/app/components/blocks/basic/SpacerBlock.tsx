"use client";

import { Box, Paper, TextField, Typography } from "@mui/material";
import type { BlockComponentProps } from "../types";

export function SpacerBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const lines = Number(block.attributes.lines ?? 1);
  const linePx = 24; // 1行=24px 相当でプレビュー
  const height = Math.max(0, Math.round(lines) * linePx);

  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        borderRadius: 3,
        p: 0,
        bgcolor: "transparent",
        "&:hover .spacer-controls": {
          opacity: 1,
          pointerEvents: "auto",
        },
      }}
    >
      {/* 余白プレビュー優先 */}
      <Box
        sx={{
          width: "100%",
          height,
          borderRadius: 2,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
          bgcolor: "rgba(255,255,255,0.04)",
        }}
      />

      {/* コントロールは上にオーバーレイ */}
      <Box
        className="spacer-controls"
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          bgcolor: "rgba(0,0,0,0.3)",
          borderRadius: 1,
          px: 1,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          opacity: 0,
          transition: "opacity 120ms ease",
          pointerEvents: "none",
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Spacer lines
        </Typography>
        <TextField
          size="small"
          type="number"
          inputProps={{ min: 0, max: 50 }}
          value={Number.isNaN(lines) ? 0 : lines}
          onChange={(e) => {
            const v = Math.max(
              0,
              Math.min(50, Math.floor(Number(e.target.value ?? 0))),
            );
            onAttributesChange({ lines: v, height: v * linePx });
          }}
          disabled={readOnly}
          sx={{ width: 96 }}
        />
        <Typography variant="caption" color="text.secondary">
          ({height}px)
        </Typography>
      </Box>
    </Paper>
  );
}
