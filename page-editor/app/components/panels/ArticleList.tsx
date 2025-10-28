"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import type { MarkdownPage } from "@/types/markdown";

export interface ArticleListProps {
  articles: MarkdownPage[];
  selectedId?: string;
  isLoading?: boolean;
  onSelect: (page: MarkdownPage) => void;
  onEditMeta: (page: MarkdownPage) => void;
  onCreate: () => void;
}

export function ArticleList({
  articles,
  selectedId,
  isLoading = false,
  onSelect,
  onEditMeta,
  onCreate,
}: ArticleListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) {
      return articles;
    }
    const term = query.toLowerCase();
    return articles.filter((article) => {
      return (
        article.slug.toLowerCase().includes(term) ||
        (article.frontmatter.title ?? "").toLowerCase().includes(term) ||
        (article.frontmatter.description ?? "").toLowerCase().includes(term)
      );
    });
  }, [articles, query]);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 0, py: 1.5 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Pages
        </Typography>
        <Button size="small" variant="outlined" onClick={onCreate}>
          New page
        </Button>
      </Stack>
      <Stack spacing={1.5} sx={{ px: 0, py: 0 }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Filter by title or slug"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />
        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading pages...
          </Typography>
        ) : filtered.length === 0 ? (
          <Alert severity="info">No pages found.</Alert>
        ) : (
          <List
            disablePadding
            dense
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {filtered.map((page, index) => {
              const isActive = page.id === selectedId;
              return (
                <Box
                  key={page.id}
                  sx={{ bgcolor: isActive ? "action.hover" : "transparent" }}
                >
                  <ListItemButton
                    sx={{ alignItems: "flex-start", gap: 1, px: 1.5, py: 1.25 }}
                    onClick={() => onSelect(page)}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ lineHeight: 1.4 }}
                        >
                          {page.frontmatter.title || "Untitled page"}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="div"
                          >
                            {page.slug}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            component="div"
                          >
                            {new Date(page.updatedAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      variant="text"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditMeta(page);
                      }}
                    >
                      Edit
                    </Button>
                  </ListItemButton>
                  {index < filtered.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </Stack>
    </Box>
  );
}
