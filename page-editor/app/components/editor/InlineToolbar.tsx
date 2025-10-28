"use client";

import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import StrikethroughSRoundedIcon from "@mui/icons-material/StrikethroughSRounded";
import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import type { EditorCommand } from "@/types/editor";

const BUTTONS: Array<{
  command: EditorCommand;
  icon: JSX.Element;
  title: string;
}> = [
  {
    command: "toggle-bold",
    icon: <FormatBoldRoundedIcon fontSize="small" />,
    title: "Bold (Cmd+B)",
  },
  {
    command: "toggle-italic",
    icon: <FormatItalicRoundedIcon fontSize="small" />,
    title: "Italic (Cmd+I)",
  },
  {
    command: "toggle-underline",
    icon: <FormatUnderlinedRoundedIcon fontSize="small" />,
    title: "Underline (Cmd+U)",
  },
  {
    command: "toggle-strike",
    icon: <StrikethroughSRoundedIcon fontSize="small" />,
    title: "Strikethrough (Cmd+Shift+X)",
  },
  {
    command: "toggle-code",
    icon: <CodeRoundedIcon fontSize="small" />,
    title: "Inline code (Cmd+`)",
  },
];

export interface InlineToolbarProps {
  onCommand?: (command: EditorCommand) => void;
  disabled?: boolean;
}

export function InlineToolbar({
  onCommand,
  disabled = false,
}: InlineToolbarProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        display: "inline-flex",
        borderRadius: 999,
        px: 1,
        py: 0.5,
        alignItems: "center",
        bgcolor: "rgba(12,18,32,0.92)",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: "0 18px 42px rgba(12, 15, 22, 0.4)",
      }}
      role="toolbar"
      aria-label="Inline formatting controls"
    >
      <ToggleButtonGroup size="small" color="primary">
        {BUTTONS.map(({ command, icon, title }) => (
          <Tooltip key={command} title={title}>
            <ToggleButton
              value={command}
              onClick={() => onCommand?.(command)}
              disabled={disabled}
              sx={{ border: "none" }}
            >
              {icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
}
