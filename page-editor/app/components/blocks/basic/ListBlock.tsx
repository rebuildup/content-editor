"use client";

import { Box, Checkbox, Stack, Typography } from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function ListBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
  autoFocus,
  onKeyDown,
}: BlockComponentProps) {
  const kind =
    (block.attributes.kind as string) ||
    (block.attributes.ordered ? "ordered" : "unordered");
  const order = (block.attributes.order as number) || 1;
  const checked = Boolean(block.attributes.checked);

  const renderMarker = () => {
    if (kind === "todo") {
      return (
        <Checkbox
          size="small"
          checked={checked}
          onChange={() => onAttributesChange?.({ checked: !checked })}
          disabled={readOnly}
        />
      );
    }
    if (kind === "ordered") {
      return (
        <Typography
          variant="body2"
          sx={{ width: 24, textAlign: "right", pr: 1 }}
        >
          {order}.
        </Typography>
      );
    }
    return (
      <Typography variant="body2" sx={{ width: 24, textAlign: "center" }}>
        •
      </Typography>
    );
  };

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      {renderMarker()}
      <Box sx={{ flex: 1 }}>
        <EditableText
          value={block.content}
          onChange={(v) => onContentChange?.(v)}
          readOnly={readOnly}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          placeholder="List item"
          sx={{
            flex: 1,
            typography: "body1",
            backgroundColor: "transparent",
            border: "none",
            paddingX: 0,
            paddingY: 0.5,
            "&:focus": {
              border: "none",
              backgroundColor: "transparent",
            },
          }}
        />
      </Box>
    </Stack>
  );
}
