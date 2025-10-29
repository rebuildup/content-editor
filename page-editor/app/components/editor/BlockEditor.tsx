"use client";

import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Box, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { nanoid } from "nanoid";
import {
  type JSX,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CodeBlock } from "@/app/components/blocks/advanced/CodeBlock";
import { MathBlock } from "@/app/components/blocks/advanced/MathBlock";
import { TableOfContentsBlock } from "@/app/components/blocks/advanced/TableOfContentsBlock";
import { ToggleBlock } from "@/app/components/blocks/advanced/ToggleBlock";
import { CalloutBlock } from "@/app/components/blocks/basic/CalloutBlock";
import { DividerBlock } from "@/app/components/blocks/basic/DividerBlock";
import { HeadingBlock } from "@/app/components/blocks/basic/HeadingBlock";
import { ListBlock } from "@/app/components/blocks/basic/ListBlock";
import { QuoteBlock } from "@/app/components/blocks/basic/QuoteBlock";
import { SpacerBlock } from "@/app/components/blocks/basic/SpacerBlock";
import { TextBlock } from "@/app/components/blocks/basic/TextBlock";
import { BoardBlock } from "@/app/components/blocks/database/BoardBlock";
import { CalendarBlock } from "@/app/components/blocks/database/CalendarBlock";
import { GalleryBlock } from "@/app/components/blocks/database/GalleryBlock";
import { TableBlock } from "@/app/components/blocks/database/TableBlock";
import { AudioBlock } from "@/app/components/blocks/media/AudioBlock";
import { EmbedBlock } from "@/app/components/blocks/media/EmbedBlock";
import { CustomHtmlBlock } from "@/app/components/blocks/advanced/CustomHtmlBlock";
import { FileBlock } from "@/app/components/blocks/media/FileBlock";
import { ImageBlock } from "@/app/components/blocks/media/ImageBlock";
import { VideoBlock } from "@/app/components/blocks/media/VideoBlock";
import { WebBookmarkBlock } from "@/app/components/blocks/media/WebBookmarkBlock";
import type { BlockComponentProps } from "@/app/components/blocks/types";
import { createInitialBlock } from "@/lib/editor/factory";
import type { Block, BlockType, ListItem } from "@/types/blocks";

const BLOCK_COMPONENTS: Partial<
  Record<BlockType, (props: BlockComponentProps) => JSX.Element>
> = {
  paragraph: TextBlock,
  heading: HeadingBlock,
  list: ListBlock,
  quote: QuoteBlock,
  callout: CalloutBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  image: ImageBlock,
  video: VideoBlock,
  audio: AudioBlock,
  file: FileBlock,
  bookmark: WebBookmarkBlock,
  embed: EmbedBlock,
  code: CodeBlock,
  math: MathBlock,
  toggle: ToggleBlock,
  table: TableBlock,
  tableOfContents: TableOfContentsBlock,
  gallery: GalleryBlock,
  board: BoardBlock,
  calendar: CalendarBlock,
  html: CustomHtmlBlock,
};

const AVAILABLE_INSERT_TYPES: BlockType[] = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "callout",
  "divider",
  "image",
  "html",
];

type DropPosition = "before" | "after";

interface DragOverInfo {
  id: string;
  position: DropPosition;
}

interface BlockEditorProps {
  editorId: string;
  blocks: Block[];
  applyBlocks: (updater: (previous: Block[]) => Block[]) => void;
  readOnly?: boolean;
  onSelectBlock?: (blockId: string | null) => void;
}

export function BlockEditor({
  editorId,
  blocks,
  applyBlocks,
  readOnly = false,
  onSelectBlock,
}: BlockEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFocusId) {
      return;
    }
    const timeout = window.setTimeout(() => setPendingFocusId(null), 300);
    return () => window.clearTimeout(timeout);
  }, [pendingFocusId]);

  const setActive = useCallback(
    (id: string | null) => {
      setActiveId(id);
      onSelectBlock?.(id);
    },
    [onSelectBlock],
  );

  const updateContent = useCallback(
    (id: string, content: string) => {
      applyBlocks((previous) =>
        previous.map((block) =>
          block.id === id ? normalizeBlockContent(block, content) : block,
        ),
      );
    },
    [applyBlocks],
  );

  const updateAttributes = useCallback(
    (id: string, attributes: Record<string, unknown>) => {
      applyBlocks((previous) =>
        previous.map((block) =>
          block.id === id
            ? {
                ...block,
                attributes: {
                  ...block.attributes,
                  ...attributes,
                },
              }
            : block,
        ),
      );
    },
    [applyBlocks],
  );

  const moveBlock = useCallback(
    (sourceId: string, targetId: string, position: DropPosition) => {
      if (sourceId === targetId) {
        return;
      }
      applyBlocks((previous) => {
        const sourceIndex = previous.findIndex((block) => block.id === sourceId);
        const targetIndex = previous.findIndex((block) => block.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) {
          return previous;
        }

        const next = [...previous];
        const [moved] = next.splice(sourceIndex, 1);

        let insertIndex = targetIndex;
        if (targetIndex > sourceIndex) {
          insertIndex -= 1;
        }
        if (position === "after") {
          insertIndex += 1;
        }

        insertIndex = Math.max(0, Math.min(next.length, insertIndex));
        next.splice(insertIndex, 0, moved);
        return next;
      });
      setActive(sourceId);
    },
    [applyBlocks, setActive],
  );

  const removeBlock = useCallback(
    (id: string) => {
      applyBlocks((previous) => previous.filter((block) => block.id !== id));
    },
    [applyBlocks],
  );

  const insertBlockAfter = useCallback(
    (id: string | null, type: BlockType) => {
      applyBlocks((previous) => {
        const next = [...previous];
        const block = createInitialBlock(type);
        if (!id) {
          next.push(block);
          return next;
        }
        const index = previous.findIndex((item) => item.id === id);
        if (index === -1) {
          next.push(block);
          return next;
        }
        next.splice(index + 1, 0, block);
        return next;
      });
    },
    [applyBlocks],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      applyBlocks((previous) => {
        const index = previous.findIndex((item) => item.id === id);
        if (index === -1) {
          return previous;
        }
        const next = [...previous];
        const source = next[index];
        next.splice(index + 1, 0, {
          ...source,
          id: nanoid(8),
          attributes: { ...source.attributes },
        });
        return next;
      });
    },
    [applyBlocks],
  );

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLSpanElement>, blockId: string) => {
      if (readOnly) {
        return;
      }
      setDraggingId(blockId);
      setDragOverInfo(null);
      event.dataTransfer?.setData("application/x-editor-block-id", blockId);
      event.dataTransfer?.setDragImage?.(event.currentTarget, 16, 16);
      event.dataTransfer.effectAllowed = "move";
      setActive(blockId);
    },
    [readOnly, setActive],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, blockId: string) => {
      if (readOnly || !draggingId || draggingId === blockId) {
        return;
      }
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const isAfter = event.clientY > bounds.top + bounds.height / 2;
      setDragOverInfo({ id: blockId, position: isAfter ? "after" : "before" });
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    },
    [draggingId, readOnly],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, blockId: string) => {
      if (readOnly) {
        return;
      }
      event.preventDefault();
      const sourceId =
        event.dataTransfer?.getData("application/x-editor-block-id") ??
        draggingId;
      if (!sourceId || sourceId === blockId) {
        setDraggingId(null);
        setDragOverInfo(null);
        return;
      }
      const position =
        dragOverInfo?.id === blockId ? dragOverInfo.position : "after";
      moveBlock(sourceId, blockId, position);
      setDraggingId(null);
      setDragOverInfo(null);
    },
    [dragOverInfo, draggingId, moveBlock, readOnly],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverInfo(null);
  }, []);

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>, blockId: string) => {
      const related = event.relatedTarget as Node | null;
      if (!related || !event.currentTarget.contains(related)) {
        setDragOverInfo((current) =>
          current?.id === blockId ? null : current,
        );
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (blockId: string, event: KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) {
        return;
      }
      if (event.key !== "Enter" || event.shiftKey) {
        return;
      }

      const target = event.currentTarget;
      if (!isCaretAtEnd(target)) {
        return;
      }

      event.preventDefault();
      const textContent = target.textContent ?? "";
      const newBlock = createInitialBlock("paragraph");

      applyBlocks((previous) => {
        const index = previous.findIndex((block) => block.id === blockId);
        if (index === -1) {
          return previous;
        }
        const next = [...previous];
        next[index] = normalizeBlockContent(next[index], textContent);
        next.splice(index + 1, 0, newBlock);
        return next;
      });

      setPendingFocusId(newBlock.id);
      setActive(newBlock.id);
    },
    [applyBlocks, readOnly, setActive],
  );

  const handleOpenMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, blockId: string) => {
      setMenuAnchor(event.currentTarget);
      setMenuTarget(blockId);
    },
    [],
  );

  const handleCloseMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuTarget(null);
  }, []);

  const isMenuOpen = Boolean(menuAnchor);
  const _selectedBlock = useMemo(
    () => blocks.find((block) => block.id === menuTarget),
    [blocks, menuTarget],
  );

  return (
    <Stack
      spacing={2}
      {...(editorId && { "data-editor-id": editorId })}
      sx={{
        position: "relative",
        maxWidth: 768,
        mx: "auto",
        width: "100%",
        bgcolor: "transparent",
      }}
    >
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type] ?? UnknownBlock;
        const isActive = block.id === activeId;
        const isDragging = draggingId === block.id;
        const dropIndicator =
          dragOverInfo?.id === block.id ? dragOverInfo.position : null;
        const supportsKeyboardShortcuts =
          block.type === "paragraph" || block.type === "heading";
        const handleBlockKeyDown = supportsKeyboardShortcuts
          ? (event: KeyboardEvent<HTMLDivElement>) =>
              handleKeyDown(block.id, event)
          : undefined;

        return (
          <Box
            key={block.id}
            onClick={() => setActive(block.id)}
            onDragEnter={(event) => handleDragOver(event, block.id)}
            onDragOver={(event) => handleDragOver(event, block.id)}
            onDragLeave={(event) => handleDragLeave(event, block.id)}
            onDrop={(event) => handleDrop(event, block.id)}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "stretch",
              gap: 1.5,
              px: 1,
              py: 1.25,
              borderRadius: 1,
              bgcolor: isActive ? "action.hover" : "rgba(255,255,255,0.02)",
              cursor: readOnly ? "default" : "text",
              opacity: isDragging ? 0.4 : 1,
              transition: "background-color 0.2s ease, opacity 0.2s ease",
              boxShadow:
                dropIndicator === "before"
                  ? (theme) => `inset 0 2px 0 ${theme.palette.primary.main}`
                  : dropIndicator === "after"
                    ? (theme) => `inset 0 -2px 0 ${theme.palette.primary.main}`
                    : undefined,
              "&:not(:last-of-type)": {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
            data-block-id={block.id}
          >
            {!readOnly && (
              <Box
                component="span"
                role="button"
                aria-label="Reorder block"
                draggable
                tabIndex={0}
                onDragStart={(event) => handleDragStart(event, block.id)}
                onDragEnd={handleDragEnd}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  minHeight: "2rem",
                  cursor: "grab",
                  color: isActive ? "text.primary" : "text.secondary",
                  "&:active": {
                    cursor: "grabbing",
                  },
                }}
              >
                <DragIndicatorRoundedIcon fontSize="small" />
              </Box>
            )}
            <Stack
              spacing={1}
              sx={{ flex: 1, px: 0, py: 0, position: "relative" }}
            >
              {!readOnly && (
                <IconButton
                  size="small"
                  onClick={(event) => handleOpenMenu(event, block.id)}
                  sx={{ position: "absolute", top: 4, right: 4 }}
                  aria-label="Block menu"
                >
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
              )}
              <Box sx={{ px: 0.5, py: 0.25 }}>
                <Component
                  block={block}
                  readOnly={readOnly}
                  onContentChange={(content) =>
                    updateContent(block.id, content)
                  }
                  onAttributesChange={(attributes) =>
                    updateAttributes(block.id, attributes)
                  }
                  autoFocus={block.id === pendingFocusId}
                  onKeyDown={handleBlockKeyDown}
                />
              </Box>
            </Stack>
          </Box>
        );
      })}

      <Menu
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        slotProps={{
          paper: { sx: { bgcolor: "background.paper" } },
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuTarget) duplicateBlock(menuTarget);
            handleCloseMenu();
          }}
        >
          Duplicate block
        </MenuItem>
        <MenuItem
          disabled={blocks.length === 1}
          onClick={() => {
            if (menuTarget) removeBlock(menuTarget);
            handleCloseMenu();
          }}
        >
          Delete block
        </MenuItem>
        <MenuItem disabled divider>
          Insert after
        </MenuItem>
        {AVAILABLE_INSERT_TYPES.map((type) => (
          <MenuItem
            key={`menu-${type}`}
            onClick={() => {
              if (menuTarget) {
                insertBlockAfter(menuTarget, type);
              } else {
                insertBlockAfter(null, type);
              }
              handleCloseMenu();
            }}
          >
            {type}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}

function UnknownBlock({ block }: { block: Block }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "rgba(239,68,68,0.12)",
        border: (theme) => `1px dashed ${theme.palette.error.main}`,
        color: "error.light",
      }}
    >
      Unsupported block: {block.type}
    </Box>
  );
}

function normalizeBlockContent(block: Block, content: string): Block {
  const sanitized = content.replace(/\u00A0/g, " ");

  if (block.type === "paragraph") {
    return transformParagraphBlock(block, sanitized);
  }

  if (block.type === "heading") {
    if (/^\s*#{1,6}\s+/.test(sanitized)) {
      return {
        ...block,
        content: sanitized,
      };
    }
    return {
      ...block,
      type: "paragraph",
      content: sanitized,
      attributes: {},
    };
  }

  return {
    ...block,
    content: sanitized,
  };
}

function transformParagraphBlock(block: Block, content: string): Block {
  const trimmed = content.trimStart();

  if (!trimmed) {
    return {
      ...block,
      type: "paragraph",
      content: "",
      attributes: {},
    };
  }

  const headingMatch = trimmed.match(/^(#{1,6})\s+\S/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    return {
      ...block,
      type: "heading",
      content,
      attributes: {
        level,
      },
    };
  }

  if (/^\[( |x|X)\]\s+/.test(trimmed)) {
    return {
      ...block,
      type: "list",
      content: "",
      attributes: {
        ordered: false,
        items: createListItemsFromLines(content, "todo"),
      },
    };
  }

  if (/^[-*+]\s+/.test(trimmed)) {
    return {
      ...block,
      type: "list",
      content: "",
      attributes: {
        ordered: false,
        items: createListItemsFromLines(content, "unordered"),
      },
    };
  }

  if (/^\d+\.\s+/.test(trimmed)) {
    return {
      ...block,
      type: "list",
      content: "",
      attributes: {
        ordered: true,
        items: createListItemsFromLines(content, "ordered"),
      },
    };
  }

  return {
    ...block,
    type: "paragraph",
    content,
    attributes: {},
  };
}

function createListItemsFromLines(
  content: string,
  mode: "unordered" | "ordered" | "todo",
): ListItem[] {
  const rawLines = content.split(/\r?\n/);
  const items: ListItem[] = [];

  rawLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    if (mode === "todo") {
      const match = trimmed.match(/^\[( |x|X)\]\s*(.*)$/);
      const checkedToken = match?.[1] ?? " ";
      const text = match?.[2] ?? trimmed.replace(/^\[( |x|X)\]\s*/, "");
      items.push({
        id: nanoid(6),
        content: text,
        checked: checkedToken.toLowerCase() === "x",
      });
      return;
    }

    if (mode === "unordered") {
      const match = trimmed.match(/^[-*+]\s+(.*)$/);
      const text = match?.[1] ?? trimmed.replace(/^[-*+]\s*/, "");
      items.push({
        id: nanoid(6),
        content: text,
      });
      return;
    }

    if (mode === "ordered") {
      const match = trimmed.match(/^\d+\.\s+(.*)$/);
      const text = match?.[1] ?? trimmed.replace(/^\d+\.\s*/, "");
      items.push({
        id: nanoid(6),
        content: text,
      });
    }
  });

  if (items.length === 0) {
    items.push({
      id: nanoid(6),
      content: "",
    });
  }

  return items;
}

function isCaretAtEnd(element: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const focusNode = selection.focusNode;
  if (!focusNode || !element.contains(focusNode)) {
    return false;
  }

  const range = selection.getRangeAt(0).cloneRange();
  range.selectNodeContents(element);
  range.setStart(focusNode, selection.focusOffset);

  const remaining = range.toString();
  return remaining.length === 0;
}
