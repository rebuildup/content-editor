"use client";

import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export interface SidebarProps {
  children: ReactNode;
  title?: string;
}

export function Sidebar({ children, title }: SidebarProps) {
  return (
    <Stack spacing={3}>
      {title && (
        <Typography
          variant="h6"
          component="header"
          sx={{ letterSpacing: 0.3, fontWeight: 600 }}
        >
          {title}
        </Typography>
      )}
      <Stack component="section" spacing={3}>
        {children}
      </Stack>
    </Stack>
  );
}
