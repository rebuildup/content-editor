"use client";

import { Alert, Button, Stack } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockEditor } from "@/app/components/editor/BlockEditor";
import { BlockToolbar } from "@/app/components/editor/BlockToolbar";
import { EditorLayout } from "@/app/components/layout/EditorLayout";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { ArticleList } from "@/app/components/panels/ArticleList";
import { BlockLibrary } from "@/app/components/panels/BlockLibrary";
import { ContentSelector } from "@/app/components/panels/ContentSelector";
import { MediaManager } from "@/app/components/panels/MediaManager";
import {
  createMarkdownPage,
  deleteMarkdownPage,
  fetchMarkdownPage,
  fetchMarkdownPages,
  updateMarkdownPage,
} from "@/lib/api/markdown";
import { fetchMediaList } from "@/lib/api/media";
import { convertMarkdownToBlocks } from "@/lib/conversion";
import { createInitialBlock } from "@/lib/editor/factory";
import { useAutoSave, useEditorState } from "@/lib/editor/state";
import { normalizeSlug } from "@/lib/utils/validation";
import type { Block, BlockType } from "@/types/blocks";
import type { MarkdownPage } from "@/types/markdown";
import type { MediaItem } from "@/types/media";

// SSR/CSR で ID が変わるとハイドレーション不一致が発生するため、
// 初期ブロックは固定 ID で定義して安定化させる
const INITIAL_BLOCKS: Block[] = [
  {
    id: "initial-paragraph",
    type: "paragraph",
    content: "",
    attributes: {},
  },
];

interface ToastMessage {
  type: "success" | "error";
  text: string;
}

export default function PageEditorHome() {
  const [selectedContentId, setSelectedContentId] = useState("");
  const [pages, setPages] = useState<MarkdownPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const {
    editorId,
    page,
    setPage,
    blocks,
    updateBlocks,
    applyBlocks,
    markdown,
    hasChanges,
    setHasChanges,
    reset,
  } = useEditorState({ initialBlocks: INITIAL_BLOCKS });

  const autoSave = useAutoSave({
    contentId: selectedContentId,
    pageId: page?.id ?? "",
    markdown,
    enabled: Boolean(selectedContentId && page?.id),
  });

  const showMessage = useCallback((message: ToastMessage) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadPages = useCallback(
    async (contentId: string) => {
      try {
        console.log("[PageEditor] Loading pages for contentId:", contentId);
        setPagesLoading(true);
        const data = await fetchMarkdownPages(contentId);
        console.log("[PageEditor] Pages loaded:", data);
        setPages(
          data.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
      } catch (error) {
        console.error("[PageEditor] Failed to load pages", error);
        showMessage({
          type: "error",
          text: `Failed to load pages: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      } finally {
        setPagesLoading(false);
      }
    },
    [showMessage],
  );

  const loadMedia = useCallback(
    async (contentId: string) => {
      if (!contentId) {
        setMedia([]);
        return;
      }
      try {
        console.log("[PageEditor] Loading media for contentId:", contentId);
        setMediaLoading(true);
        const items = await fetchMediaList(contentId);
        console.log("[PageEditor] Media loaded:", items);
        setMedia(items);
      } catch (error) {
        console.error("[PageEditor] Failed to load media", error);
        showMessage({
          type: "error",
          text: `Failed to load media: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      } finally {
        setMediaLoading(false);
      }
    },
    [showMessage],
  );

  const resetEditor = useCallback(() => {
    setPage(null);
    updateBlocks(INITIAL_BLOCKS);
    setActiveBlockId(null);
    setHasChanges(false);
  }, [setPage, updateBlocks, setHasChanges]);

  useEffect(() => {
    if (!selectedContentId) {
      setPages([]);
      setMedia([]);
      resetEditor();
      return;
    }
    void loadPages(selectedContentId);
    void loadMedia(selectedContentId);
  }, [selectedContentId, loadPages, loadMedia, resetEditor]);

  const handleSelectPage = useCallback(
    async (targetPage: MarkdownPage) => {
      try {
        const detail = await fetchMarkdownPage(targetPage.id);
        const value = convertMarkdownToBlocks(detail.body ?? "");
        reset(detail, value);
        setActiveBlockId(value[0]?.id ?? null);
      } catch (error) {
        console.error("Failed to load page detail", error);
        showMessage({ type: "error", text: "Failed to load the page." });
      }
    },
    [reset, showMessage],
  );

  const handleManualSave = useCallback(async () => {
    if (!selectedContentId || !page) {
      showMessage({ type: "error", text: "Select a page before saving." });
      return;
    }

    try {
      await updateMarkdownPage({
        id: page.id,
        contentId: selectedContentId,
        slug: page.slug,
        frontmatter: page.frontmatter,
        body: markdown,
        updatedAt: new Date().toISOString(),
      });
      setHasChanges(false);
      showMessage({ type: "success", text: "Saved successfully." });
      void loadPages(selectedContentId);
    } catch (error) {
      console.error("Manual save failed", error);
      showMessage({ type: "error", text: "Failed to save changes." });
    }
  }, [
    selectedContentId,
    page,
    markdown,
    setHasChanges,
    showMessage,
    loadPages,
  ]);

  const handleCreatePage = useCallback(async () => {
    if (!selectedContentId) {
      showMessage({ type: "error", text: "Select a content space first." });
      return;
    }

    const title = window.prompt("Enter a title for the new page");
    if (!title) {
      return;
    }
    const defaultSlug = normalizeSlug(title);
    const slugInput = window.prompt("Enter a slug", defaultSlug);
    if (slugInput === null) {
      return;
    }
    const slug = normalizeSlug(slugInput) || defaultSlug;

    try {
      const now = new Date().toISOString();
      const response = await createMarkdownPage({
        contentId: selectedContentId,
        slug,
        frontmatter: {
          title,
          slug,
          updated: now,
          draft: true,
        },
        body: "",
        createdAt: now,
        updatedAt: now,
      });

      await loadPages(selectedContentId);
      const newPageId = response.page?.id ?? response.id;
      if (newPageId) {
        const detail = await fetchMarkdownPage(newPageId);
        const value = convertMarkdownToBlocks(detail.body ?? "");
        reset(detail, value);
        setActiveBlockId(value[0]?.id ?? null);
        showMessage({ type: "success", text: "Created a new page." });
      }
    } catch (error) {
      console.error("Failed to create page", error);
      showMessage({ type: "error", text: "Failed to create page." });
    }
  }, [selectedContentId, loadPages, reset, showMessage]);

  const handleEditMeta = useCallback(
    async (target: MarkdownPage) => {
      const title = window.prompt("Page title", target.frontmatter.title ?? "");
      if (title === null) {
        return;
      }
      const slugInput = window.prompt("Slug", target.slug);
      if (slugInput === null) {
        return;
      }
      const slug = normalizeSlug(slugInput) || target.slug;

      try {
        const result = await updateMarkdownPage({
          id: target.id,
          contentId: target.contentId ?? selectedContentId,
          slug,
          frontmatter: {
            ...target.frontmatter,
            title,
            slug,
          },
        });
        await loadPages(selectedContentId);
        if (result.page && page?.id === result.page.id) {
          const value = convertMarkdownToBlocks(result.page.body ?? "");
          reset(result.page, value);
          setActiveBlockId(value[0]?.id ?? null);
        }
        showMessage({ type: "success", text: "Updated page metadata." });
      } catch (error) {
        console.error("Failed to update metadata", error);
        showMessage({ type: "error", text: "Failed to update metadata." });
      }
    },
    [selectedContentId, page, loadPages, reset, showMessage],
  );

  const handleDeletePage = useCallback(
    async (target: MarkdownPage) => {
      const label = target.frontmatter.title || target.slug || "this page";
      const confirmDelete = window.confirm(`Delete the page "${label}"?`);
      if (!confirmDelete) {
        return;
      }
      try {
        await deleteMarkdownPage(target.id);
        showMessage({ type: "success", text: "Deleted page." });
        if (page?.id === target.id) {
          resetEditor();
        }
        await loadPages(selectedContentId);
      } catch (error) {
        console.error("Failed to delete page", error);
        showMessage({ type: "error", text: "Failed to delete page." });
      }
    },
    [page, resetEditor, showMessage, loadPages, selectedContentId],
  );

  const handleInsertBlock = useCallback(
    (type: BlockType) => {
      applyBlocks((previous) => {
        const next = [...previous];
        const insertIndex = activeBlockId
          ? previous.findIndex((block) => block.id === activeBlockId)
          : previous.length - 1;
        const block = createInitialBlock(type);
        if (insertIndex === -1) {
          next.push(block);
        } else {
          next.splice(insertIndex + 1, 0, block);
        }
        return next;
      });
    },
    [applyBlocks, activeBlockId],
  );

  const toolbarState = useMemo(
    () => ({
      isSaving: autoSave.isSaving,
      lastSaved: autoSave.lastSaved,
      hasUnsavedChanges: hasChanges || autoSave.hasUnsavedChanges,
    }),
    [
      autoSave.isSaving,
      autoSave.lastSaved,
      autoSave.hasUnsavedChanges,
      hasChanges,
    ],
  );

  return (
    <EditorLayout
      sidebar={
        <Sidebar title="Content">
          <ContentSelector
            selectedContentId={selectedContentId}
            onSelect={(value) => {
              setSelectedContentId(value);
              resetEditor();
            }}
          />
          <ArticleList
            articles={pages}
            selectedId={page?.id}
            isLoading={pagesLoading}
            onSelect={handleSelectPage}
            onEditMeta={handleEditMeta}
            onCreate={handleCreatePage}
          />
          <MediaManager
            contentId={selectedContentId}
            media={media}
            isLoading={mediaLoading}
            onRefresh={() => {
              if (selectedContentId) {
                void loadMedia(selectedContentId);
              }
            }}
          />
          {page && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeletePage(page)}
            >
              Delete page
            </Button>
          )}
        </Sidebar>
      }
      editor={
        <BlockEditor
          editorId={editorId}
          blocks={blocks}
          applyBlocks={applyBlocks}
          readOnly={false}
          onSelectBlock={setActiveBlockId}
          contentId={selectedContentId}
        />
      }
      rightPanel={<BlockLibrary onInsertBlock={handleInsertBlock} />}
      toolbar={
        <Stack spacing={2}>
          <BlockToolbar
            onSave={handleManualSave}
            isSaving={toolbarState.isSaving}
            lastSaved={toolbarState.lastSaved}
            hasUnsavedChanges={toolbarState.hasUnsavedChanges}
          />
          {toast && (
            <Alert severity={toast.type} variant="outlined">
              {toast.text}
            </Alert>
          )}
        </Stack>
      }
    />
  );
}
