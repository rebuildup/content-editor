"use client";

import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
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

export function AudioBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const src = (block.attributes.src as string | undefined) ?? "";
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
        avatar={<GraphicEqRoundedIcon color="primary" />}
        title="Audio block"
        subheader="Provide an audio source URL"
        sx={{
          "& .MuiCardHeader-subheader": { color: "text.secondary" },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <TextField
            label="Audio URL"
            fullWidth
            value={src}
            onChange={(event) =>
              onAttributesChange({ src: event.target.value })
            }
            disabled={readOnly}
            placeholder="https://example.com/audio.mp3"
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
          {src ? (
            /* biome-ignore lint/a11y/useMediaCaption: media preview in editor */
            <audio
              src={src}
              controls={controls}
              autoPlay={autoplay}
              style={{ width: "100%" }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Paste an audio URL to enable preview.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
