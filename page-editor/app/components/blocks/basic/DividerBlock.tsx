"use client";

import { Divider } from "@mui/material";
import type { BlockComponentProps } from "../types";

export function DividerBlock(_: BlockComponentProps) {
  return (
    <Divider
      sx={{
        borderColor: "rgba(255,255,255,0.08)",
        borderBottomWidth: 2,
      }}
    />
  );
}
