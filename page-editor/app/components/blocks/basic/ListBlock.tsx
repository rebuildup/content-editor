"use client";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { nanoid } from "nanoid";
import type { MouseEvent as ReactMouseEvent } from "react";
import { EditableText } from "@/app/components/editor/EditableText";
import type { ListItem } from "@/types/blocks";
import type { BlockComponentProps } from "../types";

export function ListBlock({
  block,
  readOnly,
  onAttributesChange,
}: BlockComponentProps) {
  const items: ListItem[] = Array.isArray(block.attributes.items)
    ? (block.attributes.items as ListItem[])
    : [{ id: nanoid(6), content: "" }];

  const ordered = Boolean(block.attributes.ordered);

  const emitItems = (nextItems: ListItem[], nextOrdered = ordered) => {
    onAttributesChange({ items: nextItems, ordered: nextOrdered });
  };

  const handleOrderedChange = (
    _: ReactMouseEvent<HTMLElement>,
    value: "ordered" | "unordered",
  ) => {
    if (!value) {
      return;
    }
    emitItems(items, value === "ordered");
  };

  const handleItemChange = (id: string, content: string) => {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            content,
          }
        : item,
    );
    emitItems(next);
  };

  const handleAddItem = () => {
    emitItems([...items, { id: nanoid(6), content: "" }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      emitItems([{ id: nanoid(6), content: "" }]);
      return;
    }
    emitItems(items.filter((item) => item.id !== id));
  };

  const handleToggleCheck = (id: string) => {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            checked: !item.checked,
          }
        : item,
    );
    emitItems(next);
  };

  const listComponent = ordered ? "ol" : "ul";

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.02)",
        p: 2.5,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          value={ordered ? "ordered" : "unordered"}
          onChange={handleOrderedChange}
        >
          <ToggleButton value="unordered" disabled={readOnly}>
            <FormatListBulletedRoundedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="ordered" disabled={readOnly}>
            <FormatListNumberedRoundedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          size="small"
          startIcon={<PlaylistAddRoundedIcon />}
          onClick={handleAddItem}
          disabled={readOnly}
        >
          Add item
        </Button>
      </Stack>
      <Stack
        component={listComponent as "ul"}
        spacing={1}
        sx={{
          listStyle: ordered ? "decimal" : "disc",
          pl: ordered ? 3 : 2.5,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            component="li"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Checkbox
              size="small"
              checked={Boolean(item.checked)}
              onChange={() => handleToggleCheck(item.id)}
              disabled={readOnly}
            />
            <EditableText
              value={item.content}
              onChange={(value) => handleItemChange(item.id, value)}
              readOnly={readOnly}
              placeholder="List item"
              sx={{ flex: 1 }}
            />
            {!readOnly && (
              <Tooltip title="Remove item">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
