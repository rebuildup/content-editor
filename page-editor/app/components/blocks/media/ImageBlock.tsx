"use client";

import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import {
  Card,
  CardContent,
  CardMedia,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function ImageBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const src = (block.attributes.src as string | undefined) ?? "";
  const alt = (block.attributes.alt as string | undefined) ?? "";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      {src ? (
        <CardMedia
          component="img"
          height="220"
          src={src}
          alt={alt}
          sx={{ objectFit: "cover" }}
        />
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ py: 6, color: "text.secondary" }}
        >
          <ImageRoundedIcon fontSize="large" color="primary" />
          <Typography variant="body2">Paste an image URL</Typography>
        </Stack>
      )}
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Image URL"
              fullWidth
              value={src}
              onChange={(event) =>
                onAttributesChange({ src: event.target.value })
              }
              placeholder="https://example.com/image.png"
              disabled={readOnly}
            />
            <TextField
              label="Alt text"
              fullWidth
              value={alt}
              onChange={(event) =>
                onAttributesChange({ alt: event.target.value })
              }
              placeholder="Describe the image"
              disabled={readOnly}
            />
          </Stack>
          <EditableText
            value={block.content}
            onChange={onContentChange}
            readOnly={readOnly}
            placeholder="Caption"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
