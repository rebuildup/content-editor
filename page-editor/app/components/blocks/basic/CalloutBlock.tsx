"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

const TYPES = [
  { value: "info", label: "Info", color: "#3b82f6" },
  { value: "success", label: "Success", color: "#22c55e" },
  { value: "warning", label: "Warning", color: "#f59e0b" },
  { value: "danger", label: "Danger", color: "#ef4444" },
];

export function CalloutBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const type = (block.attributes.type as string | undefined) ?? "info";
  const icon = (block.attributes.icon as string | undefined) ?? "!";
  const tone = TYPES.find((item) => item.value === type) ?? TYPES[0];

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderLeft: `4px solid ${tone.color}`,
        p: 2.5,
        bgcolor: "rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <FormControl size="small" fullWidth>
          <InputLabel id="callout-type-label">Tone</InputLabel>
          <Select
            labelId="callout-type-label"
            label="Tone"
            value={type}
            onChange={(event) =>
              onAttributesChange({ type: event.target.value })
            }
            disabled={readOnly}
          >
            {TYPES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />
                  <Typography variant="body2">{item.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Icon"
          value={icon}
          inputProps={{ maxLength: 2 }}
          onChange={(event) => onAttributesChange({ icon: event.target.value })}
          disabled={readOnly}
          sx={{ width: { xs: "100%", sm: 140 } }}
        />
      </Stack>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography
          variant="h5"
          sx={{
            minWidth: 36,
            textAlign: "center",
            color: tone.color,
            fontWeight: 700,
            lineHeight: "36px",
          }}
        >
          {icon}
        </Typography>
        <EditableText
          value={block.content}
          onChange={onContentChange}
          readOnly={readOnly}
          placeholder="Callout content"
          sx={{ flex: 1 }}
        />
      </Stack>
    </Paper>
  );
}
