"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import { Box, Menu, MenuItem, Stack } from "@mui/material";
import { nanoid } from "nanoid";
import {
  type DragEvent,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CodeBlock } from "@/app/components/blocks/advanced/CodeBlock";
import { CustomHtmlBlock } from "@/app/components/blocks/advanced/CustomHtmlBlock";
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
import { TableBlock } from "@/app/components/blocks/database/TableBlock";
import { AudioBlock } from "@/app/components/blocks/media/AudioBlock";
import { EmbedBlock } from "@/app/components/blocks/media/EmbedBlock";
import { FileBlock } from "@/app/components/blocks/media/FileBlock";
import { GalleryBlock } from "@/app/components/blocks/media/GalleryBlock";
import { ImageBlock } from "@/app/components/blocks/media/ImageBlock";
import { VideoBlock } from "@/app/components/blocks/media/VideoBlock";
import { WebBookmarkBlock } from "@/app/components/blocks/media/WebBookmarkBlock";
import type { BlockComponentProps } from "@/app/components/blocks/types";
import { createInitialBlock } from "@/lib/editor/factory";
import type { Block, BlockType } from "@/types/blocks";

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
  contentId?: string;
}

export function BlockEditor({
  editorId,
  blocks,
  applyBlocks,
  readOnly = false,
  onSelectBlock,
  contentId,
}: BlockEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [addMenuTarget, setAddMenuTarget] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
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

  const openHandleMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, blockId: string) => {
      setMenuAnchor(event.currentTarget);
      setMenuTarget(blockId);
    },
    [],
  );

  const openAddMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, blockId: string) => {
      setAddMenuAnchor(event.currentTarget);
      setAddMenuTarget(blockId);
    },
    [],
  );

  const updateContent = useCallback(
    (id: string, content: string) => {
      applyBlocks((previous) =>
        previous.map((block) =>
          block.id === id
            ? normalizeBlockContentOnTyping(block, content)
            : block,
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
        const sourceIndex = previous.findIndex(
          (block) => block.id === sourceId,
        );
        const targetIndex = previous.findIndex(
          (block) => block.id === targetId,
        );
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

      // Backspace: 先頭で押したら、リストを段落+Markdownトークンに戻す
      if (
        event.key === "Backspace" &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        const target = event.currentTarget;
        const selection = window.getSelection();
        const isAtStart = (() => {
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0).cloneRange();
          range.selectNodeContents(target);
          range.setEnd(selection.focusNode ?? target, selection.focusOffset);
          return range.toString().length === 0;
        })();
        const current = blocks.find((b) => b.id === blockId);
        const contentEmpty = (current?.content ?? "").length === 0;
        if (isAtStart || contentEmpty) {
          if (current?.type === "list") {
            event.preventDefault();
            const kind =
              (current.attributes.kind as string) ||
              (current.attributes.ordered
                ? "ordered"
                : current.attributes.checked !== undefined
                  ? "todo"
                  : "unordered");
            const order = (current.attributes.order as number) || 1;
            const prefix =
              kind === "todo"
                ? current.attributes.checked
                  ? "[x] "
                  : "[ ] "
                : kind === "ordered"
                  ? `${order}. `
                  : "- ";
            applyBlocks((prev) =>
              prev.map((b) =>
                b.id === blockId
                  ? {
                      ...b,
                      type: "paragraph",
                      content: `${prefix}${b.content ?? ""}`,
                      attributes: {},
                    }
                  : b,
              ),
            );
            setPendingFocusId(blockId);
            setActive(blockId);
            return;
          }
          if (current?.type === "quote" || current?.type === "callout") {
            event.preventDefault();
            applyBlocks((prev) =>
              prev.map((b) =>
                b.id === blockId
                  ? {
                      ...b,
                      type: "paragraph",
                      content: `> ${b.content ?? ""}`,
                      attributes: {},
                    }
                  : b,
              ),
            );
            setPendingFocusId(blockId);
            setActive(blockId);
            return;
          }
        }
      }

      // スペース入力時もリスト変換を実行
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      if (event.key === "Enter" && event.shiftKey) {
        return;
      }

      const target = event.currentTarget;
      // Enter の場合は末尾でないと実行しない、スペースの場合は常に実行
      if (event.key === "Enter" && !isCaretAtEnd(target)) {
        return;
      }

      // Space: 現在のブロックをリストへ正規化するだけ（新規ブロックは作らない）
      if (event.key === " ") {
        const textContent = target.textContent ?? "";
        applyBlocks((previous) =>
          previous.map((block) =>
            block.id === blockId
              ? normalizeBlockContent(block, textContent)
              : block,
          ),
        );
        return;
      }

      // Enter: 従来通り、正規化＋必要なら次行を生成
      event.preventDefault();
      const textContent = target.textContent ?? "";
      let newBlock = createInitialBlock("paragraph");

      applyBlocks((previous) => {
        const index = previous.findIndex((block) => block.id === blockId);
        if (index === -1) {
          return previous;
        }
        const next = [...previous];
        const normalized = normalizeBlockContent(next[index], textContent);
        next[index] = normalized;

        // リストの場合は同種の次要素を自動生成
        if (normalized.type === "list") {
          const kind =
            (normalized.attributes.kind as string) ||
            (normalized.attributes.ordered
              ? "ordered"
              : normalized.attributes.checked !== undefined
                ? "todo"
                : "unordered");
          const currentOrder = (normalized.attributes.order as number) || 1;
          newBlock = {
            ...createInitialBlock("list"),
            content: "",
            attributes:
              kind === "ordered"
                ? { kind: "ordered", order: currentOrder + 1 }
                : kind === "todo"
                  ? { kind: "todo", checked: false }
                  : { kind: "unordered" },
          } as Block;
        }

        next.splice(index + 1, 0, newBlock);
        return next;
      });

      setPendingFocusId(newBlock.id);
      setActive(newBlock.id);
    },
    [applyBlocks, readOnly, setActive, blocks],
  );

  const handleCloseMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuTarget(null);
  }, []);

  const handleCloseAddMenu = useCallback(() => {
    setAddMenuAnchor(null);
    setAddMenuTarget(null);
  }, []);

  const handleBlockMouseEnter = useCallback((blockId: string) => {
    setHoveredBlockId(blockId);
  }, []);

  const handleBlockMouseLeave = useCallback(() => {
    setHoveredBlockId(null);
  }, []);

  const isMenuOpen = Boolean(menuAnchor);
  const isAddMenuOpen = Boolean(addMenuAnchor);
  const _selectedBlock = useMemo(
    () => blocks.find((block) => block.id === menuTarget),
    [blocks, menuTarget],
  );
  const copyBlockToClipboard = useCallback(
    async (id: string) => {
      const target = blocks.find((b) => b.id === id);
      if (!target) return;
      try {
        // 単一ブロックをMarkdown化してコピー
        const { convertBlocksToMarkdown } = await import("@/lib/conversion");
        const md = convertBlocksToMarkdown([target]);
        await navigator.clipboard.writeText(md);
      } catch {
        // フォールバックでJSON文字列
        try {
          await navigator.clipboard.writeText(JSON.stringify(target));
        } catch {}
      }
    },
    [blocks],
  );

  const convertBlockType = useCallback(
    (id: string, nextType: BlockType) => {
      applyBlocks((previous) =>
        previous.map((block) => {
          if (block.id !== id) return block;
          const { createEmptyBlock } = require("@/lib/conversion");
          const defaults = createEmptyBlock(nextType);
          return {
            ...block,
            type: nextType,
            attributes: defaults.attributes,
          } as Block;
        }),
      );
    },
    [applyBlocks],
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
          block.type === "paragraph" ||
          block.type === "heading" ||
          block.type === "list";
        const handleBlockKeyDown = supportsKeyboardShortcuts
          ? (event: KeyboardEvent<HTMLDivElement>) =>
              handleKeyDown(block.id, event)
          : undefined;

        return (
          <Box
            key={block.id}
            onClick={() => setActive(block.id)}
            onMouseEnter={() => handleBlockMouseEnter(block.id)}
            onMouseLeave={handleBlockMouseLeave}
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
            {!readOnly && (hoveredBlockId === block.id || isActive) && (
              <Box
                component="button"
                aria-label="Block handle"
                draggable
                tabIndex={0}
                onClick={(event) =>
                  openHandleMenu(
                    event as unknown as MouseEvent<HTMLButtonElement>,
                    block.id,
                  )
                }
                onDragStart={(event) => handleDragStart(event, block.id)}
                onDragEnd={handleDragEnd}
                sx={{
                  position: "absolute",
                  top: 8,
                  left: -36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  lineHeight: 0,
                  width: 28,
                  height: 28,
                  cursor: "grab",
                  color: isActive ? "text.primary" : "text.secondary",
                  "&:active": { cursor: "grabbing" },
                }}
              >
                <DragIndicatorRoundedIcon fontSize="small" />
              </Box>
            )}
            {!readOnly && (hoveredBlockId === block.id || isActive) && (
              <Box
                component="button"
                aria-label="Add block"
                tabIndex={0}
                onClick={(event) =>
                  openAddMenu(
                    event as unknown as MouseEvent<HTMLButtonElement>,
                    block.id,
                  )
                }
                sx={{
                  position: "absolute",
                  top: 8,
                  left: -64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  lineHeight: 0,
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  color: isActive ? "text.primary" : "text.secondary",
                }}
              >
                <AddRoundedIcon fontSize="small" />
              </Box>
            )}
            <Stack
              spacing={1}
              sx={{ flex: 1, px: 0, py: 0, position: "relative" }}
            >
              <Box sx={{ px: 0.5, py: 0.25 }}>
                <Component
                  block={block}
                  readOnly={readOnly}
                  contentId={contentId}
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
        <MenuItem
          onClick={() => {
            if (menuTarget) void copyBlockToClipboard(menuTarget);
            handleCloseMenu();
          }}
        >
          Copy block
        </MenuItem>
        <MenuItem disabled divider>
          Convert to
        </MenuItem>
        {AVAILABLE_INSERT_TYPES.filter((t) => t !== _selectedBlock?.type).map(
          (type) => (
            <MenuItem
              key={`convert-${type}`}
              onClick={() => {
                if (menuTarget) convertBlockType(menuTarget, type);
                handleCloseMenu();
              }}
            >
              {type}
            </MenuItem>
          ),
        )}
      </Menu>

      <Menu
        anchorEl={addMenuAnchor}
        open={isAddMenuOpen}
        onClose={handleCloseAddMenu}
        slotProps={{
          paper: { sx: { bgcolor: "background.paper" } },
        }}
      >
        {AVAILABLE_INSERT_TYPES.map((type) => (
          <MenuItem
            key={`add-${type}`}
            onClick={() => {
              if (addMenuTarget) {
                insertBlockAfter(addMenuTarget, type);
              } else {
                insertBlockAfter(null, type);
              }
              handleCloseAddMenu();
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

function normalizeBlockContentOnTyping(block: Block, content: string): Block {
  const sanitized = content.replace(/\u00A0/g, " ");

  if (block.type === "paragraph") {
    return transformParagraphBlockOnTyping(block, sanitized);
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

  // リスト自動変換（半角スペース必須）
  // チェックリスト [ ] / [x]
  const todoMatch = trimmed.match(/^\[( |x|X)\]\s+(.*)$/);
  if (todoMatch) {
    return {
      ...block,
      type: "list",
      content: todoMatch[2],
      attributes: { kind: "todo", checked: todoMatch[1].toLowerCase() === "x" },
    };
  }

  // ドットリスト -, *, +
  const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
  if (unorderedMatch) {
    return {
      ...block,
      type: "list",
      content: unorderedMatch[1],
      attributes: { kind: "unordered" },
    };
  }

  // 数字リスト 1.
  const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
  if (orderedMatch) {
    const order = parseInt(orderedMatch[1] ?? "1", 10) || 1;
    return {
      ...block,
      type: "list",
      content: orderedMatch[2],
      attributes: { kind: "ordered", order },
    };
  }

  // Divider: --- のみの行を区切り線に変換
  if (/^---+$/.test(trimmed)) {
    return {
      ...block,
      type: "divider",
      content: "",
      attributes: {},
    };
  }

  // Callout: "> [!NOTE]" のような記述を含む場合、callout ブロックに変換（1行目はそのまま保持）
  if (/^>\s*\[!(NOTE|WARNING|CALLOUT|TIP|CAUTION|IMPORTANT)\]/i.test(content)) {
    // 先頭の "> " を取り除いて [!TYPE] は保持
    const withoutArrow = content.replace(/^>\s*/, "");
    return {
      ...block,
      type: "callout",
      content: withoutArrow,
      attributes: {},
    };
  }

  // 引用 > で始まる場合は Quote ブロックに変換（全文1ブロック）
  const quoteMatch = trimmed.match(/^>\s+(.*)$/);
  if (quoteMatch) {
    return {
      ...block,
      type: "quote",
      content: quoteMatch[1],
      attributes: {},
    };
  }

  return {
    ...block,
    type: "paragraph",
    content,
    attributes: {},
  };
}

function transformParagraphBlockOnTyping(block: Block, content: string): Block {
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
      attributes: { level },
    };
  }

  // タイピング中はリスト自動変換を行わない（タグ編集を妨げないため）
  return {
    ...block,
    type: "paragraph",
    content,
    attributes: {},
  };
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
