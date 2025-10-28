"use client";

import MovieCreationRoundedIcon from "@mui/icons-material/MovieCreationRounded";
import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { BlockComponentProps } from "../types";

export function VideoBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const src = (block.attributes.src as string | undefined) ?? "";
  const poster = (block.attributes.poster as string | undefined) ?? "";
  const autoplay = Boolean(block.attributes.autoplay);
  const controls = block.attributes.controls !== false;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <CardHeader
        avatar={<MovieCreationRoundedIcon color="primary" />}
        title="Video block"
        subheader="Supports hosted mp4 or streaming URLs"
        sx={{ "& .MuiCardHeader-subheader": { color: "text.secondary" } }}
      />
      {src ? (
        <video
          src={src}
          poster={poster || undefined}
          controls={controls}
          autoPlay={autoplay}
          muted
          style={{
            width: "100%",
            maxHeight: 320,
            objectFit: "cover",
          }}
        />
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 3, pb: 1 }}
        >
          Paste a video URL to enable preview.
        </Typography>
      )}
      <CardContent>
        <Stack spacing={2}>
          <TextField
            label="Video URL"
            value={src}
            onChange={(event) =>
              onAttributesChange({ src: event.target.value })
            }
            placeholder="https://example.com/video.mp4"
            disabled={readOnly}
          />
          <TextField
            label="Poster image"
            value={poster}
            onChange={(event) =>
              onAttributesChange({ poster: event.target.value })
            }
            placeholder="Thumbnail image URL"
            disabled={readOnly}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoplay}
                  onChange={(event) =>
                    onAttributesChange({ autoplay: event.target.checked })
                  }
                  disabled={readOnly}
                />
              }
              label="Autoplay"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={controls}
                  onChange={(event) =>
                    onAttributesChange({ controls: event.target.checked })
                  }
                  disabled={readOnly}
                />
              }
              label="Show controls"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
