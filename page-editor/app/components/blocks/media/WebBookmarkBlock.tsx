"use client";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { sanitizeUrl } from "@/lib/utils/sanitize";
import type { BlockComponentProps } from "../types";

export function WebBookmarkBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const url = (block.attributes.url as string | undefined) ?? "";
  const title = (block.attributes.title as string | undefined) ?? "";
  const description =
    (block.attributes.description as string | undefined) ?? "";
  const image = (block.attributes.image as string | undefined) ?? "";

  const [hovered, setHovered] = useState(false);
  const safeUrl = useMemo(() => sanitizeUrl(url), [url]);

  useEffect(() => {
    let cancelled = false;
    const fetchOg = async () => {
      if (!safeUrl) {
        if (image) {
          onAttributesChange({ image: "" });
        }
        return;
      }
      try {
        const res = await fetch(
          `/api/metadata?url=${encodeURIComponent(safeUrl)}`,
        );
        const data = (await res.json()) as {
          image?: string;
          title?: string;
          description?: string;
        };
        if (!cancelled) {
          const next: Record<string, string> = {};
          if ((data.image || "") !== (image || ""))
            next.image = data.image || "";
          if ((data.title || "") !== (title || ""))
            next.title = data.title || "";
          if ((data.description || "") !== (description || ""))
            next.description = data.description || "";
          if (Object.keys(next).length > 0) {
            onAttributesChange(next);
          }
        }
      } catch {
        if (!cancelled && image) {
          onAttributesChange({ image: "" });
        }
      }
    };
    void fetchOg();
    return () => {
      cancelled = true;
    };
  }, [safeUrl, image, title, description, onAttributesChange]);

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      {!readOnly && (
        <Box
          className="bookmark-url-input"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 120ms ease",
            bgcolor: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            borderRadius: 1,
            maxWidth: "min(520px, 80vw)",
          }}
        >
          <TextField
            size="small"
            placeholder="https://example.com"
            value={url}
            onChange={(event) =>
              onAttributesChange({ url: event.target.value })
            }
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            sx={{
              m: 1,
              minWidth: 260,
              "& .MuiInputBase-root": { bgcolor: "rgba(0,0,0,0.5)" },
            }}
          />
        </Box>
      )}
      <CardContent sx={{ p: 0 }}></CardContent>
      <CardActionArea
        component="a"
        disabled={!url}
        href={url || undefined}
        target="_blank"
        rel="noreferrer"
        sx={{
          display: "flex",
          alignItems: "stretch",
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {image ? (
          <CardMedia
            component="img"
            src={image}
            alt=""
            sx={{
              width: 140,
              objectFit: "cover",
            }}
          />
        ) : (
          <Box sx={{ width: 0 }} />
        )}
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title ||
              (() => {
                try {
                  return safeUrl ? new URL(safeUrl).host : "";
                } catch {
                  return "";
                }
              })() ||
              "Bookmark"}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
          {url && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {url}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
