"use client";

import { Box, Stack } from "@mui/material";
import type { ReactNode } from "react";

export interface EditorLayoutProps {
  sidebar: ReactNode;
  editor: ReactNode;
  toolbar?: ReactNode;
  rightPanel?: ReactNode;
}

export function EditorLayout({
  sidebar,
  editor,
  toolbar,
  rightPanel,
}: EditorLayoutProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: rightPanel
          ? { xs: "1fr", lg: "360px 1fr 360px" }
          : { xs: "1fr", lg: "360px 1fr" },
        height: "100vh",
        width: "100vw",
        bgcolor: "transparent",
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "block" },
          bgcolor: "transparent",
          // 枠線は使わず背景コントラストのみ
          overflowY: "auto",
          px: 3,
          py: 4,
        }}
      >
        {sidebar}
      </Box>
      <Stack
        component="main"
        sx={{
          position: "relative",
          overflow: "hidden",
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
          gap: 3,
        }}
      >
        {toolbar && (
          <Box component="section" sx={{ flexShrink: 0 }}>
            {toolbar}
          </Box>
        )}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 0,
            bgcolor: "transparent",
          }}
        >
          <Box
            component="section"
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 3.5 },
            }}
          >
            {editor}
          </Box>
        </Box>
      </Stack>
      {rightPanel && (
        <Box
          component="aside"
          sx={{
            display: { xs: "none", lg: "block" },
            bgcolor: "transparent",
            // 枠線は使わず背景コントラストのみ
            overflowY: "auto",
            px: 3,
            py: 4,
          }}
        >
          {rightPanel}
        </Box>
      )}
    </Box>
  );
}
