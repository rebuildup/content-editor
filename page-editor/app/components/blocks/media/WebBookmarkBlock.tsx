"use client";

import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack spacing={2}>
          <TextField
            label="URL"
            value={url}
            onChange={(event) =>
              onAttributesChange({ url: event.target.value })
            }
            disabled={readOnly}
            placeholder="https://example.com"
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(event) =>
                onAttributesChange({ title: event.target.value })
              }
              disabled={readOnly}
              fullWidth
            />
            <TextField
              label="Thumbnail URL"
              value={image}
              onChange={(event) =>
                onAttributesChange({ image: event.target.value })
              }
              disabled={readOnly}
              fullWidth
            />
          </Stack>
          <TextField
            label="Description"
            value={description}
            onChange={(event) =>
              onAttributesChange({ description: event.target.value })
            }
            disabled={readOnly}
            multiline
            minRows={2}
          />
        </Stack>
      </CardContent>
      <CardActionArea
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
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 140,
              bgcolor: "rgba(255,255,255,0.04)",
            }}
          >
            <LaunchRoundedIcon color="primary" />
          </Stack>
        )}
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title || "Bookmark preview"}
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
