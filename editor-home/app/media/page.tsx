"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";

export default function MediaPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          メディア管理
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          メディア管理機能は現在準備中です
        </Typography>
        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Button component={Link} href="/" variant="outlined">
            ← コンテンツ管理
          </Button>
          <Button component={Link} href="/markdown" variant="outlined">
            ← Markdownページ管理
          </Button>
          <Button component={Link} href="/databases" variant="outlined">
            → データベース管理
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
