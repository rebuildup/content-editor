"use client";

import { alpha, Box, type SxProps, type Theme, useTheme } from "@mui/material";
import { forwardRef, useEffect, useRef } from "react";

export interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
  autoFocus?: boolean;
  readOnly?: boolean;
}

const baseStyles: SxProps<Theme> = (theme) => ({
  minHeight: "1.8em",
  padding: theme.spacing(1, 1.5),
  borderRadius: 2,
  border: "1px solid transparent",
  backgroundColor: alpha(theme.palette.common.white, 0.04),
  transition: "border-color 0.2s ease, background 0.2s ease",
  outline: "none",
  typography: "body1",
  lineHeight: 1.7,
  "&:focus": {
    borderColor: alpha(theme.palette.primary.main, 0.5),
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  "&[data-placeholder]:empty::before": {
    content: "attr(data-placeholder)",
    color: theme.palette.text.disabled,
  },
  "&.is-readonly": {
    opacity: 0.7,
    pointerEvents: "none",
  },
});

export const EditableText = forwardRef<HTMLDivElement, EditableTextProps>(
  function EditableText(
    { value, onChange, placeholder, sx, autoFocus = false, readOnly = false },
    forwardedRef,
  ) {
    const internalRef = useRef<HTMLDivElement | null>(null);
    const theme = useTheme();
    const mergedSx: SxProps<Theme> = [
      baseStyles(theme),
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ];

    useEffect(() => {
      const element =
        (forwardedRef as React.RefObject<HTMLDivElement>)?.current ??
        internalRef.current;
      if (!element) return;

      const isFocused = document.activeElement === element;
      // 入力中（フォーカス中）は DOM を上書きしない（キャレットジャンプ防止）
      if (!isFocused && element.textContent !== value) {
        element.textContent = value;
      }

      if (autoFocus && !isFocused) {
        element.focus();
      }
    }, [value, forwardedRef, autoFocus]);

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
      if (readOnly) {
        return;
      }
      const text = event.currentTarget.textContent ?? "";
      onChange(text);
    };

    return (
      /* biome-ignore lint/a11y/useSemanticElements: contentEditable surface provides block-style editing */
      <Box
        ref={forwardedRef ?? internalRef}
        role="textbox"
        component="div"
        contentEditable={!readOnly}
        suppressContentEditableWarning
        tabIndex={readOnly ? -1 : 0}
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={handleInput}
        sx={mergedSx}
        className={readOnly ? "is-readonly" : undefined}
      />
    );
  },
);
