"use client";

import { Stack } from "@mui/material";
import { useMemo } from "react";
import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function HeadingBlock({
  block,
  readOnly,
  onContentChange,
  onAttributesChange: _onAttributesChange,
}: BlockComponentProps) {
  // 先頭の # の個数から見出しレベルを自動検出（1〜6）。無ければ 2 扱い。
  const level = useMemo(() => {
    const match = /^#{1,6}\s/.exec(block.content ?? "");
    if (!match) return 2;
    const hashes = match[0].trim().split(" ")[0].length; // # の個数
    return Math.min(Math.max(hashes, 1), 6);
  }, [block.content]);

  const variant = useMemo(() => {
    return level === 1
      ? "h3"
      : level === 2
        ? "h4"
        : level === 3
          ? "h5"
          : "subtitle1";
  }, [level]);

  return (
    <Stack spacing={1}>
      <EditableText
        value={block.content}
        onChange={onContentChange}
        readOnly={readOnly}
        placeholder="Heading"
        sx={(theme) => ({
          typography: variant,
          fontWeight: 700,
          color: theme.palette.text.primary,
          backgroundColor: "transparent",
          paddingX: 0,
          paddingY: 0,
          border: "none",
          "&:focus": {
            border: "none",
            backgroundColor: "transparent",
          },
        })}
      />
    </Stack>
  );
}
