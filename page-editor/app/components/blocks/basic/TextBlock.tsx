"use client";

import { EditableText } from "@/app/components/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function TextBlock({
  block,
  readOnly,
  onContentChange,
}: BlockComponentProps) {
  return (
    <EditableText
      value={block.content}
      onChange={onContentChange}
      readOnly={readOnly}
      placeholder="Write text"
      sx={{
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
  );
}
