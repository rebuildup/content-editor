"use client";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import {
  Card,
  CardContent,
  CardHeader,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { formatFileSize } from "@/lib/utils/file-upload";
import type { BlockComponentProps } from "../types";

export function FileBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const url = (block.attributes.src as string | undefined) ?? "";
  const name = (block.attributes.filename as string | undefined) ?? "";
  const size = block.attributes.size as number | undefined;

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
        avatar={<DescriptionRoundedIcon color="primary" />}
        title="File attachment"
        subheader="Provide a downloadable file link"
        sx={{ "& .MuiCardHeader-subheader": { color: "text.secondary" } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <TextField
            label="File name"
            value={name}
            onChange={(event) =>
              onAttributesChange({ filename: event.target.value })
            }
            disabled={readOnly}
          />
          <TextField
            label="URL"
            value={url}
            onChange={(event) =>
              onAttributesChange({ src: event.target.value })
            }
            disabled={readOnly}
            placeholder="https://example.com/file.pdf"
          />
          {url ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Link href={url} target="_blank" rel="noreferrer">
                {name || url}
              </Link>
              {typeof size === "number" && (
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(size)}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Paste a file URL to enable download link.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
