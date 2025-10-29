import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { updateMarkdownPage } from "@/lib/api/markdown";
import { convertBlocksToMarkdown, createEmptyBlock } from "@/lib/conversion";
import type { Block } from "@/types/blocks";
import type { MarkdownPage } from "@/types/markdown";

export interface UseEditorStateOptions {
  initialPage?: MarkdownPage | null;
  initialBlocks?: Block[];
}

export function useEditorState({
  initialPage = null,
  initialBlocks,
}: UseEditorStateOptions = {}) {
  const [page, setPage] = useState<MarkdownPage | null>(initialPage ?? null);
  const [editorId, setEditorId] = useState<string>("");
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks && initialBlocks.length > 0
      ? initialBlocks
      : [createEmptyBlock("paragraph")],
  );

  // Generate editorId only on client side to avoid hydration mismatch
  useEffect(() => {
    setEditorId(nanoid(8));
  }, []);
  const markdown = useMemo(() => convertBlocksToMarkdown(blocks), [blocks]);
  const [hasChanges, setHasChanges] = useState(false);

  const normalize = useCallback((value: Block[]) => {
    return value.length > 0 ? value : [createEmptyBlock("paragraph")];
  }, []);

  const updateBlocks = useCallback(
    (value: Block[]) => {
      setBlocks(normalize(value));
      setHasChanges(true);
    },
    [normalize],
  );

  const applyBlocks = useCallback(
    (updater: (previous: Block[]) => Block[]) => {
      setBlocks((previous) => normalize(updater(previous)));
      setHasChanges(true);
    },
    [normalize],
  );

  const reset = useCallback(
    (nextPage: MarkdownPage, nextBlocks: Block[]) => {
      setPage(nextPage);
      setBlocks(normalize(nextBlocks));
      setHasChanges(false);
    },
    [normalize],
  );

  return {
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
  };
}

interface UseAutoSaveOptions {
  contentId: string;
  pageId: string;
  markdown: string;
  interval?: number;
  enabled?: boolean;
}

export function useAutoSave({
  contentId,
  pageId,
  markdown,
  interval = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const save = useCallback(async () => {
    if (!enabled || !markdown || !pageId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateMarkdownPage({
        id: pageId,
        contentId,
        body: markdown,
        updatedAt: new Date().toISOString(),
      });

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Auto-save failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes automatically.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [contentId, pageId, markdown, enabled]);

  useEffect(() => {
    if (!enabled || !markdown || !pageId) {
      return;
    }

    setHasUnsavedChanges(true);

    const timeoutId = setTimeout(save, interval);

    return () => clearTimeout(timeoutId);
  }, [markdown, save, interval, enabled, pageId]);

  const manualSave = useCallback(async () => {
    await save();
  }, [save]);

  return {
    isSaving,
    lastSaved,
    error,
    hasUnsavedChanges,
    manualSave,
  };
}
