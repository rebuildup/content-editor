"use client";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function ToggleBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange,
}: BlockComponentProps) {
  const summary = (block.attributes.summary as string | undefined) ?? "Details";
  const [expanded, setExpanded] = useState(true);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, open) => setExpanded(open)}
      disableGutters
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "rgba(255,255,255,0.02)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <EditableText
          value={summary}
          onChange={(value) => onAttributesChange({ summary: value })}
          readOnly={readOnly}
          placeholder="Toggle summary"
          sx={{
            fontWeight: 600,
            backgroundColor: "transparent",
            border: "none",
            paddingX: 0,
          }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          <EditableText
            value={block.content}
            onChange={onContentChange}
            readOnly={readOnly}
            placeholder="Toggle content"
            sx={{ minHeight: "64px" }}
          />
          <Typography variant="caption" color="text.secondary">
            Toggle blocks collapse long explanations or FAQs.
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
