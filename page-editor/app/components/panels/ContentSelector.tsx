"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchContentList } from "@/lib/api/content";
import type { ContentIndexItem } from "@/types/content";

export interface ContentSelectorProps {
  selectedContentId?: string;
  onSelect: (contentId: string) => void;
}

export function ContentSelector({
  selectedContentId,
  onSelect,
}: ContentSelectorProps) {
  const [contents, setContents] = useState<ContentIndexItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedContents = useMemo(
    () =>
      [...contents].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [contents],
  );

  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchContentList();
      setContents(data);
    } catch (err) {
      console.error("Failed to load contents", err);
      setError(err instanceof Error ? err.message : "Failed to load contents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  const lastUpdatedLabel = useMemo(() => {
    if (!selectedContentId) {
      return null;
    }
    const target = sortedContents.find((item) => item.id === selectedContentId);
    if (!target) {
      return null;
    }
    return new Date(target.updatedAt).toLocaleString();
  }, [sortedContents, selectedContentId]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>Content</Typography>
        <Button size="small" variant="text" onClick={() => void loadContents()} disabled={loading}>Refresh</Button>
      </Stack>
      <Box sx={{ px: 0, py: 0 }}>
        {loading && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Loading content list...
            </Typography>
          </Stack>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <Stack spacing={1}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="content-selector-label">Content</InputLabel>
              <Select
                labelId="content-selector-label"
                label="Content"
                value={selectedContentId ?? ""}
                onChange={(event) => onSelect(event.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: { bgcolor: "background.paper" },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Select content</em>
                </MenuItem>
                {sortedContents.map((content) => (
                  <MenuItem key={content.id} value={content.id}>
                    {content.title || content.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {lastUpdatedLabel && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdatedLabel}
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
