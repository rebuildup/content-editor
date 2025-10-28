"use client";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Box, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { nanoid } from "nanoid";
import {
  type JSX,
  type MouseEvent,
  useCallback,
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
import { FileBlock } from "@/app/components/blocks/media/FileBlock";
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
};

const AVAILABLE_INSERT_TYPES: BlockType[] = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "callout",
  "divider",
  "image",
];

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
          block.id === id
            ? {
                ...block,
                content,
              }
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
      data-editor-id={editorId}
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

        return (
          <Box
            key={block.id}
            onClick={() => setActive(block.id)}
            sx={{
              position: "relative",
              px: 1.5,
              py: 1.25,
              borderRadius: 1,
              bgcolor: isActive ? "action.hover" : "rgba(255,255,255,0.02)",
              cursor: readOnly ? "default" : "pointer",
              transition: "background-color 0.2s ease",
              "&:not(:last-of-type)": {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Stack spacing={1} sx={{ px: 0, py: 0 }}>
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
