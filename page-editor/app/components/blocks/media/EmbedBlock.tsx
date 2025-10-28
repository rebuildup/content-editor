"use client";

import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { BlockComponentProps } from "../types";

export function EmbedBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const url = (block.attributes.url as string | undefined) ?? "";
  const provider = (block.attributes.provider as string | undefined) ?? "";

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
        avatar={<IosShareRoundedIcon color="primary" />}
        title="Embed block"
        subheader="Supports iframe-friendly sources"
        sx={{ "& .MuiCardHeader-subheader": { color: "text.secondary" } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <TextField
            label="Embed URL"
            value={url}
            onChange={(event) =>
              onAttributesChange({ url: event.target.value })
            }
            disabled={readOnly}
            placeholder="https://example.com/embed"
          />
          <TextField
            label="Provider"
            value={provider}
            onChange={(event) =>
              onAttributesChange({ provider: event.target.value })
            }
            disabled={readOnly}
            placeholder="YouTube, Figma, etc."
          />
          {url ? (
            <iframe
              src={url}
              title={provider || url}
              style={{
                width: "100%",
                minHeight: 240,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Paste an embed URL to preview content.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
