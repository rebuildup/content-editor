"use client";

import Accordion from "@yoopta/accordion";
import ActionMenu, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Divider from "@yoopta/divider";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import Embed from "@yoopta/embed";
import File from "@yoopta/file";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Link from "@yoopta/link";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import { BulletedList, NumberedList, TodoList } from "@yoopta/lists";
import {
  Bold,
  CodeMark,
  Highlight,
  Italic,
  Strike,
  Underline,
} from "@yoopta/marks";
import Paragraph from "@yoopta/paragraph";
import Table from "@yoopta/table";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ArticleList } from "@/components/article-list";
import { createCustomImagePlugin } from "@/components/custom-image-plugin";
import { createCustomVideoPlugin } from "@/components/custom-video-plugin";
import {
  createMarkdownPage,
  deleteMarkdownPage,
  deleteMedia,
  fetchContentList,
  fetchMarkdownPage,
  fetchMarkdownPages,
  fetchMediaList,
  getMediaUrl,
  updateMarkdownPage,
  uploadMediaFile,
} from "@/lib/api-client";
import {
  convertMarkdownToYoopta,
  convertYooptaToMarkdown,
} from "@/lib/yoopta-to-markdown";
import type { ContentIndexItem } from "@/types/content";
import type { MarkdownPage } from "@/types/markdown";
import type { MediaItem } from "@/types/media";

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
};

const INITIAL_VALUE: YooptaContentValue = {
  "welcome-block": {
    id: "welcome-block",
    type: "Paragraph",
    meta: { order: 0, depth: 0 },
    value: [
      {
        id: "welcome-text",
        type: "paragraph",
        children: [{ text: "ここにコンテンツを入力してください…" }],
      },
    ],
  },
};

interface MessageState {
  type: "success" | "error";
  text: string;
}

export default function Home() {
  const editor = useMemo(() => {
    return createYooptaEditor();
  }, []);
  const [value, setValue] = useState<YooptaContentValue>(INITIAL_VALUE);
  const [contents, setContents] = useState<ContentIndexItem[]>([]);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");

  const [articles, setArticles] = useState<MarkdownPage[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<MarkdownPage | null>(null);

  const [message, setMessage] = useState<MessageState | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSlug, setCreateSlug] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<MarkdownPage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const plugins = useMemo(() => {
    const pluginContentId = selectedContentId || "temp-id";
    return [
      Paragraph,
      HeadingOne,
      HeadingTwo,
      HeadingThree,
      Blockquote,
      NumberedList,
      BulletedList,
      TodoList,
      Code,
      Link,
      File,
      Callout,
      Divider,
      Table,
      Accordion,
      Embed,
      createCustomImagePlugin(pluginContentId),
      createCustomVideoPlugin(pluginContentId),
    ];
  }, [selectedContentId]);

  const loadContents = useCallback(async () => {
    try {
      setContentsLoading(true);
      console.log("Fetching content list...");
      const data = await fetchContentList();
      console.log("Content list fetched:", data);
      setContents(data);
    } catch (error) {
      console.error("Failed to load contents:", error);
      setMessage({
        type: "error",
        text: `コンテンツ一覧の取得に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    } finally {
      setContentsLoading(false);
    }
  }, []);

  const loadArticles = useCallback(async (contentId: string) => {
    if (!contentId) {
      setArticles([]);
      return;
    }
    try {
      setArticlesLoading(true);
      const pages = await fetchMarkdownPages(contentId);
      setArticles(
        pages.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );
    } catch (error) {
      console.error("Failed to load articles:", error);
      setMessage({
        type: "error",
        text: "記事一覧の取得に失敗しました",
      });
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  const loadMedia = useCallback(async (contentId?: string) => {
    if (!contentId) {
      setMediaList([]);
      return;
    }
    try {
      setMediaLoading(true);
      const data = await fetchMediaList(contentId);
      setMediaList(data);
    } catch (error) {
      console.error("Failed to load media:", error);
      setMessage({
        type: "error",
        text: "メディアの取得に失敗しました",
      });
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const getEditorContent = useCallback((): string => {
    try {
      // エディターから直接値を取得
      const editorValue = editor.getEditorValue();

      // エディターの値が空の場合は、value状態を使用
      const contentValue =
        editorValue && Object.keys(editorValue).length > 0 ? editorValue : value;

      if (!contentValue || Object.keys(contentValue).length === 0) {
        return "";
      }
      const markdown = convertYooptaToMarkdown(contentValue);
      return markdown;
    } catch (error) {
      console.error("Error in getEditorContent:", error);
      // エラーが発生した場合は空文字列を返す
      return "";
    }
  }, [editor, value]);

  useEffect(() => {
    if (!currentPage) {
      setHasChanges(false);
      setOriginalContent("");
      return;
    }

    // エディターの内容が変更されたかどうかを直接チェック
    const currentMarkdown = getEditorContent();
    const hasChangesValue = currentMarkdown !== (originalContent || "");

    setHasChanges(hasChangesValue);
  }, [currentPage, originalContent, getEditorContent]);

  useEffect(() => {
    console.log("selectedContentId changed:", selectedContentId);
    if (selectedContentId) {
      console.log("Loading articles and media for:", selectedContentId);
      loadArticles(selectedContentId);
      loadMedia(selectedContentId);
    } else {
      console.log("Clearing articles and media");
      setArticles([]);
      setMediaList([]);
    }
  }, [selectedContentId, loadArticles, loadMedia]);

  const resetEditor = useCallback(() => {
    // エディターの値を直接リセット
    editor.setEditorValue(INITIAL_VALUE);
    setValue(INITIAL_VALUE);
    setOriginalContent("");
    setHasChanges(false);
  }, [editor]);

  const handleContentSelect = async (contentId: string) => {
    try {
      setSelectedContentId(contentId);
      setCurrentPage(null);
      resetEditor();
      setMessage(null);
    } catch (error) {
      console.error("Error in handleContentSelect:", error);
      setMessage({
        type: "error",
        text: "コンテンツの選択中にエラーが発生しました",
      });
    }
  };

  const focusArticle = useCallback(
    (article: MarkdownPage | null) => {
      try {
        setCurrentPage(article);
        if (!article) {
          resetEditor();
          return;
        }

        if (article.body?.trim()) {
          try {
            const yooptaValue = convertMarkdownToYoopta(article.body);
            // エディターの値を直接設定
            editor.setEditorValue(yooptaValue);
            setValue(yooptaValue);
            setOriginalContent(article.body);
            setHasChanges(false);
          } catch (error) {
            console.error("Failed to parse markdown:", error);
            resetEditor();
          }
        } else {
          resetEditor();
        }
      } catch (error) {
        console.error("Error in focusArticle:", error);
        resetEditor();
      }
    },
    [resetEditor, editor],
  );

  const handleArticleSelect = (article: MarkdownPage) => {
    focusArticle(article);
  };

  const handleSave = async () => {
    if (!currentPage || !selectedContentId) return;

    try {
      setSaving(true);
      const markdown = getEditorContent();
      const payload: Partial<MarkdownPage> = {
        id: currentPage.id,
        contentId: selectedContentId,
        slug: currentPage.slug,
        frontmatter: currentPage.frontmatter,
        body: markdown,
        lang: currentPage.lang || "ja",
        status: currentPage.status || "draft",
      };

      const result = await updateMarkdownPage(payload);
      const updated =
        result.page ||
        (await fetchMarkdownPage(currentPage.id).catch(() => null));

      if (updated) {
        // 保存後はエディターの内容を保持し、originalContentのみ更新
        setCurrentPage(updated);
        setOriginalContent(markdown);
        setHasChanges(false);
      } else {
        setOriginalContent(markdown);
        setHasChanges(false);
      }

      setMessage({ type: "success", text: "記事を保存しました" });
      loadArticles(selectedContentId);
    } catch (error) {
      console.error("Failed to save article:", error);
      setMessage({
        type: "error",
        text: "記事の保存に失敗しました",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateArticle = async () => {
    if (!selectedContentId) {
      setMessage({ type: "error", text: "コンテンツを選択してください" });
      return;
    }
    if (!createTitle.trim() || !createSlug.trim()) {
      setMessage({
        type: "error",
        text: "タイトルとスラッグを入力してください",
      });
      return;
    }

    try {
      const payload: Partial<MarkdownPage> = {
        contentId: selectedContentId,
        slug: createSlug.trim(),
        frontmatter: {
          title: createTitle.trim(),
        },
        body: "",
        status: "draft",
      };

      const result = await createMarkdownPage(payload);
      setMessage({ type: "success", text: "記事を作成しました" });
      setIsCreateDialogOpen(false);
      setCreateTitle("");
      setCreateSlug("");
      await loadArticles(selectedContentId);

      const created =
        result.page || (await fetchMarkdownPage(result.id).catch(() => null));
      if (created) {
        focusArticle(created);
      } else {
        focusArticle(null);
      }
    } catch (error) {
      console.error("Failed to create article:", error);
      setMessage({ type: "error", text: "記事の作成に失敗しました" });
    }
  };

  const handleEditMeta = async () => {
    if (!editingPage) return;
    if (!editTitle.trim() || !editSlug.trim()) {
      setMessage({
        type: "error",
        text: "タイトルとスラッグを入力してください",
      });
      return;
    }

    try {
      const payload: Partial<MarkdownPage> = {
        id: editingPage.id,
        slug: editSlug.trim(),
        frontmatter: {
          ...editingPage.frontmatter,
          title: editTitle.trim(),
        },
      };
      const result = await updateMarkdownPage(payload);
      const updated =
        result.page ||
        (await fetchMarkdownPage(editingPage.id).catch(() => null));
      if (updated) {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === updated.id ? updated : article,
          ),
        );
        if (currentPage?.id === updated.id) {
          focusArticle(updated);
        }
      }

      setIsEditDialogOpen(false);
      setEditingPage(null);
      loadArticles(selectedContentId);
      setMessage({ type: "success", text: "記事情報を更新しました" });
    } catch (error) {
      console.error("Failed to update article metadata:", error);
      setMessage({ type: "error", text: "記事情報の更新に失敗しました" });
    }
  };

  const handleDeleteArticle = async (page: MarkdownPage) => {
    if (!confirm("この記事を削除しますか？")) return;
    try {
      await deleteMarkdownPage(page.id);
      setMessage({ type: "success", text: "記事を削除しました" });
      setIsEditDialogOpen(false);
      setEditingPage(null);
      if (currentPage?.id === page.id) {
        focusArticle(null);
      }
      loadArticles(selectedContentId);
    } catch (error) {
      console.error("Failed to delete article:", error);
      setMessage({ type: "error", text: "記事の削除に失敗しました" });
    }
  };

  const _handleMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!selectedContentId) return;
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadMediaFile(selectedContentId, file);
      setMessage({ type: "success", text: "メディアをアップロードしました" });
      loadMedia(selectedContentId);
    } catch (error) {
      console.error("Failed to upload media:", error);
      setMessage({
        type: "error",
        text: "メディアのアップロードに失敗しました",
      });
    } finally {
      event.target.value = "";
    }
  };

  const replaceInEditor = (transform: (markdown: string) => string) => {
    const markdown = getEditorContent();
    const updated = transform(markdown);
    const yooptaValue = convertMarkdownToYoopta(updated);
    // エディターの値を直接更新
    editor.setEditorValue(yooptaValue);
    setValue(yooptaValue);
    return updated;
  };

  const handleEmbedMedia = (media: MediaItem) => {
    if (!selectedContentId) return;
    const url = getMediaUrl(selectedContentId, media.id);
    replaceInEditor(
      (markdown) => `${markdown}\n\n![${media.filename}](${url})\n`,
    );
    setHasChanges(true);
  };

  const handleDeleteMedia = async (media: MediaItem) => {
    if (!selectedContentId) return;
    if (!confirm(`メディア「${media.filename}」を削除しますか？`)) return;
    try {
      await deleteMedia(selectedContentId, media.id);
      setMessage({ type: "success", text: "メディアを削除しました" });
      loadMedia(selectedContentId);
      const url = getMediaUrl(selectedContentId, media.id);
      replaceInEditor((markdown) => markdown.replaceAll(url, ""));
      setHasChanges(true);
    } catch (error) {
      console.error("Failed to delete media:", error);
      setMessage({ type: "error", text: "メディアの削除に失敗しました" });
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <aside
          style={{
            width: "320px",
            borderRight: "1px solid #1f1f1f",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            backgroundColor: "#050505",
          }}
        >
          <div>
            <label
              htmlFor="content-select"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              コンテンツを選択
            </label>
            <select
              id="content-select"
              value={selectedContentId}
              onChange={(e) => handleContentSelect(e.target.value)}
              disabled={contentsLoading}
              style={{
                width: "100%",
                padding: "10px 24px 10px 10px",
                borderRadius: "6px",
                border: "1px solid #333",
                backgroundColor: "#111",
                color: "#fff",
                appearance: "none",
                backgroundImage:
                  'url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23888888" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "10px",
              }}
            >
              <option value="">-- コンテンツを選択してください --</option>
              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.title} ({content.id})
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div
              style={{
                border: "1px solid",
                borderColor: message.type === "success" ? "#15803d" : "#dc2626",
                backgroundColor:
                  message.type === "success" ? "#052e16" : "#2a0909",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              {message.text}
            </div>
          )}

          {selectedContentId ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !currentPage || !hasChanges}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor:
                    saving || !currentPage || !hasChanges ? "#333" : "#2563eb",
                  color: "#fff",
                  cursor:
                    saving || !currentPage || !hasChanges
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {saving ? "保存中…" : "記事を保存"}
              </button>

              <ArticleList
                articles={articles}
                selectedArticleId={currentPage?.id}
                isLoading={articlesLoading}
                onSelect={handleArticleSelect}
                onEdit={(article) => {
                  setEditingPage(article);
                  setEditTitle(article.frontmatter.title || "");
                  setEditSlug(article.slug);
                  setIsEditDialogOpen(true);
                }}
                onNew={() => {
                  setCreateTitle("");
                  setCreateSlug("");
                  setIsCreateDialogOpen(true);
                }}
              />

              {currentPage && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>メディア</h4>
                  {mediaLoading ? (
                    <p style={{ color: "#888", fontSize: "13px" }}>取得中...</p>
                  ) : mediaList.length === 0 ? (
                    <p style={{ color: "#888", fontSize: "13px" }}>
                      メディアがありません。ファイルをアップロードしてください。
                    </p>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {mediaList.map((media) => (
                        <li
                          key={media.id}
                          style={{
                            border: "1px solid #1f1f1f",
                            borderRadius: "6px",
                            padding: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                              fontSize: "13px",
                            }}
                          >
                            <span>{media.filename}</span>
                            <span style={{ color: "#999" }}>
                              {(media.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleEmbedMedia(media)}
                              style={{
                                flex: 1,
                                padding: "4px 6px",
                                borderRadius: "4px",
                                border: "1px solid #3b82f6",
                                backgroundColor: "transparent",
                                color: "#3b82f6",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              埋め込み
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(media)}
                              style={{
                                flex: 1,
                                padding: "4px 6px",
                                borderRadius: "4px",
                                border: "1px solid #dc2626",
                                backgroundColor: "transparent",
                                color: "#dc2626",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              削除
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#888888", fontSize: "14px" }}>
              編集したいコンテンツを選択してください。
            </p>
          )}
        </aside>

        <main
          style={{
            flex: 1,
            padding: "32px",
            minHeight: "100vh",
          }}
        >
          {currentPage ? (
            <>
              <div
                style={{
                  marginBottom: "16px",
                  color: "#94a3b8",
                }}
              >
                編集中: {currentPage.frontmatter.title || "（無題）"} /{" "}
                {currentPage.slug}
              </div>
              <YooptaEditor
                editor={editor}
                plugins={plugins as unknown as never}
                tools={TOOLS}
                marks={MARKS}
                value={value}
                onChange={(newValue) => {
                  setValue(newValue);
                }}
                placeholder="ここに本文を入力するか、/ でコマンドメニューを開いてください…"
                style={{
                  width: "100%",
                  maxWidth: "900px",
                  margin: "0 auto",
                  minHeight: "600px",
                  padding: "32px",
                  backgroundColor: "transparent",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
            </>
          ) : (
            <div
              style={{
                border: "1px dashed #1f1f1f",
                borderRadius: "12px",
                padding: "48px",
                textAlign: "center",
                color: "#94a3b8",
                maxWidth: "640px",
                margin: "0 auto",
              }}
            >
              {selectedContentId
                ? "記事を選択するか、新規作成してください。"
                : "コンテンツを選択すると記事を編集できます。"}
            </div>
          )}
        </main>
      </div>

      {isCreateDialogOpen && (
        <Modal
          title="新規記事の作成"
          onClose={() => setIsCreateDialogOpen(false)}
        >
          <label className="modal-label">
            タイトル
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="modal-input"
              placeholder="例: 新機能のお知らせ"
            />
          </label>
          <label className="modal-label">
            スラッグ
            <input
              type="text"
              value={createSlug}
              onChange={(e) => setCreateSlug(e.target.value)}
              className="modal-input"
              placeholder="例: product-update"
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setIsCreateDialogOpen(false)}
              className="modal-button ghost"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleCreateArticle}
              className="modal-button"
            >
              作成
            </button>
          </div>
        </Modal>
      )}

      {isEditDialogOpen && editingPage && (
        <Modal title="記事を編集" onClose={() => setIsEditDialogOpen(false)}>
          <label className="modal-label">
            タイトル
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="modal-input"
            />
          </label>
          <label className="modal-label">
            スラッグ
            <input
              type="text"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="modal-input"
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => handleDeleteArticle(editingPage)}
              className="modal-button danger"
            >
              削除
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              className="modal-button ghost"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleEditMeta}
              className="modal-button"
            >
              更新
            </button>
          </div>
        </Modal>
      )}
      <style jsx global>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .modal {
          width: 100%;
          max-width: 420px;
          background: #050505;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .modal h3 {
          margin: 0 0 16px 0;
        }
        .modal-label {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          margin-bottom: 12px;
          gap: 4px;
        }
        .modal-input {
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid #333;
          background: #111;
          color: #fff;
        }
        .modal-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .modal-button {
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }
        .modal-button.ghost {
          background: #1f1f1f;
          color: #fff;
        }
        .modal-button.danger {
          background: #991b1b;
          color: #fff;
        }
        .modal-button:not(.ghost):not(.danger) {
          background: #2563eb;
          color: #fff;
        }
      `}</style>
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
        }}
      >
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
