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
import Image from "@yoopta/image";
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
import Video from "@yoopta/video";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentSelector } from "@/components/content-selector";
import { createCustomImagePlugin } from "@/components/custom-image-plugin";
import { createCustomVideoPlugin } from "@/components/custom-video-plugin";
import {
  createMarkdownPage,
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
import type { MarkdownPage } from "@/types/markdown";

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

// プラグインを動的に生成（selectedContentIdに依存）
const getPlugins = (contentId: string) => {
  console.log("=== getPlugins called ===");
  console.log("contentId:", contentId);

  const plugins = [
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
    contentId ? createCustomImagePlugin(contentId) : Image,
    contentId ? createCustomVideoPlugin(contentId) : Video,
    File,
    Callout,
    Divider,
    Table,
    Accordion,
    Embed,
  ];

  console.log("Generated plugins:", plugins);
  return plugins;
};

// 初期値にデフォルトコンテンツを設定
const INITIAL_VALUE: YooptaContentValue = {
  "welcome-block": {
    id: "welcome-block",
    type: "Paragraph",
    meta: { order: 0, depth: 0 },
    value: [
      {
        id: "welcome-text",
        type: "paragraph",
        children: [{ text: "ここに記事を入力してください..." }],
      },
    ],
  },
};

export default function Home() {
  const editor = useMemo(() => createYooptaEditor(), []);
  const [value, setValue] = useState<YooptaContentValue>(INITIAL_VALUE);
  const [selectedContentId, setSelectedContentId] = useState<string>("");

  // エディタの初期化を確実に行う
  useEffect(() => {
    if (Object.keys(value).length === 0) {
      setValue(INITIAL_VALUE);
    }
  }, [value]);

  // デバッグ用：エディタの状態をログ出力
  useEffect(() => {
    console.log("Editor value changed:", value);
    console.log("Editor value keys:", Object.keys(value));
  }, [value]);

  // selectedContentIdの変化を監視
  useEffect(() => {
    console.log("=== selectedContentId changed ===");
    console.log("selectedContentId:", selectedContentId);
  }, [selectedContentId]);

  // プラグインをメモ化
  const plugins = useMemo(() => {
    console.log("=== useMemo plugins ===");
    console.log("selectedContentId:", selectedContentId);
    return getPlugins(selectedContentId);
  }, [selectedContentId]);
  const [currentPage, setCurrentPage] = useState<MarkdownPage | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mediaList, setMediaList] = useState<any[]>([]);

  // メディア一覧を読み込み
  const loadMediaList = useCallback(async () => {
    if (!selectedContentId) return;

    try {
      const media = await fetchMediaList(selectedContentId);
      setMediaList(media);
    } catch (err) {
      console.error("Failed to load media list:", err);
    }
  }, [selectedContentId]);

  // コンテンツが選択されたときにメディア一覧を読み込み
  useEffect(() => {
    if (selectedContentId) {
      loadMediaList();
    }
  }, [selectedContentId, loadMediaList]);

  // メディアをエディタに挿入
  const handleMediaInsert = (mediaUrl: string) => {
    // 画像を挿入（簡易版）
    alert(
      `メディアURL: ${mediaUrl}\n\nマークダウンとして挿入:\n![画像](${mediaUrl})`
    );
  };

  // Yooptaエディタの内容を取得
  const getEditorContent = (): string => {
    console.log("Current editor value:", value);
    if (!value || Object.keys(value).length === 0) {
      return "";
    }
    const markdown = convertYooptaToMarkdown(value);
    console.log("Converted markdown:", markdown);
    return markdown;
  };

  // 画像データをデータベースに保存する関数
  const saveImageToDatabase = async (
    imageDataUrl: string,
    filename: string
  ) => {
    try {
      console.log("Saving image to database:", filename);

      // DataURLからバイナリデータを抽出
      const base64Data = imageDataUrl.split(",")[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }

      // ファイルオブジェクトを作成
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const file = new (globalThis as any).File([blob], filename, {
        type: "image/jpeg",
      });

      // データベースに保存
      if (!selectedContentId) {
        throw new Error("Content ID is required");
      }
      const result = await uploadMediaFile(selectedContentId, file);
      console.log("Image saved to database:", result);

      return result;
    } catch (error) {
      console.error("Failed to save image to database:", error);
      throw error;
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!selectedContentId) {
      setMessage({
        type: "error",
        text: "コンテンツを選択してください",
      });
      return;
    }

    if (!slug) {
      setMessage({
        type: "error",
        text: "スラッグを入力してください",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // YooptaコンテンツをMarkdownに変換
      let markdown = getEditorContent();
      console.log("Saving markdown content:", markdown);

      // 画像のDataURLをデータベースに保存して置換
      if (value && Object.keys(value).length > 0) {
        const imageBlocks = Object.values(value).filter(
          (block) => block.type === "Image"
        );

        for (const block of imageBlocks) {
          const imageElement = block.value.find(
            (child: any) => child.type === "image"
          );
          if (
            imageElement &&
            (
              imageElement as { props?: { src?: string } }
            )?.props?.src?.startsWith("data:")
          ) {
            try {
              const filename = `image_${Date.now()}.jpg`;
              const result = await saveImageToDatabase(
                (imageElement as { props: { src: string } }).props.src,
                filename
              );
              if (!selectedContentId) {
                throw new Error("Content ID is required");
              }
              const mediaUrl = getMediaUrl(selectedContentId, result.id);

              // Markdown内のDataURLをデータベースURLに置換
              markdown = markdown.replace(
                (imageElement as { props: { src: string } }).props.src,
                mediaUrl
              );

              console.log("Replaced image URL:", mediaUrl);
            } catch (error) {
              console.error("Failed to save image:", error);
            }
          }
        }
      }

      const pageData: Partial<MarkdownPage> = {
        id: currentPage?.id,
        contentId: selectedContentId,
        slug,
        frontmatter: {
          title: title || "無題",
          date: new Date().toISOString(),
        },
        body: markdown,
        status: "draft",
      };

      if (currentPage?.id) {
        // 更新
        await updateMarkdownPage(pageData);
        setMessage({ type: "success", text: "保存しました" });
      } else {
        // 新規作成
        const result = await createMarkdownPage(pageData);
        setMessage({
          type: "success",
          text: `作成しました (ID: ${result.id})`,
        });

        // 現在のページ情報を更新
        const pages = await fetchMarkdownPages();
        const newPage = pages.find((p) => p.id === result.id);
        if (newPage) {
          setCurrentPage(newPage);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({
        type: "error",
        text: `保存に失敗しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`,
      });
    } finally {
      setSaving(false);
    }
  };

  // ページ読み込み
  const handleLoadPage = async () => {
    if (!slug) {
      setMessage({
        type: "error",
        text: "スラッグを入力してください",
      });
      return;
    }

    try {
      const pages = await fetchMarkdownPages();
      const page = pages.find((p) => p.slug === slug);

      if (!page) {
        setMessage({
          type: "error",
          text: "ページが見つかりません",
        });
        return;
      }

      // ページ情報を設定
      setCurrentPage(page);
      setSelectedContentId(page.contentId || "");
      setTitle(page.frontmatter.title || "");
      setSlug(page.slug);

      // Markdownをエディタに読み込み
      if (page.body?.trim()) {
        try {
          const yooptaValue = convertMarkdownToYoopta(page.body);
          setValue(yooptaValue);
        } catch (convertError) {
          console.error("Markdown conversion error:", convertError);
          // 変換に失敗した場合は初期値を使用
          setValue(INITIAL_VALUE);
        }
      } else {
        // 空のコンテンツの場合は初期化
        setValue(INITIAL_VALUE);
      }

      setMessage({ type: "success", text: "読み込みました" });
    } catch (err) {
      console.error("Load error:", err);
      setMessage({
        type: "error",
        text: `読み込みに失敗しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`,
      });
    }
  };

  // 新規作成
  const handleNew = () => {
    setCurrentPage(null);
    setValue(INITIAL_VALUE);
    setTitle("");
    setSlug("");
    setMessage(null);
  };

  return (
    <>
      <style jsx global>{`
        .yoopta-editor {
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-toolbar {
          background-color: #333333 !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-toolbar button {
          color: #ffffff !important;
          background-color: transparent !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-toolbar button:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-toolbar button.active {
          background-color: #666666 !important;
        }
        .yoopta-editor .yoopta-block {
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block p {
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block h1,
        .yoopta-editor .yoopta-block h2,
        .yoopta-editor .yoopta-block h3,
        .yoopta-editor .yoopta-block h4,
        .yoopta-editor .yoopta-block h5,
        .yoopta-editor .yoopta-block h6 {
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block blockquote {
          border-left: 4px solid #666666 !important;
          color: #cccccc !important;
        }
        .yoopta-editor .yoopta-block code {
          background-color: #333333 !important;
          color: #ffffff !important;
          border: 1px solid #666666 !important;
        }
        .yoopta-editor .yoopta-block pre {
          background-color: #333333 !important;
          border: 1px solid #666666 !important;
        }
        .yoopta-editor .yoopta-block ul,
        .yoopta-editor .yoopta-block ol {
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block li {
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block-actions {
          background-color: #333333 !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-block-actions button {
          color: #ffffff !important;
          background-color: transparent !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-block-actions button:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-block-actions button.active {
          background-color: #666666 !important;
        }
        .yoopta-editor .yoopta-block-selector {
          background-color: #333333 !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-block-selector button {
          color: #ffffff !important;
          background-color: transparent !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-block-selector button:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-block-selector button.active {
          background-color: #666666 !important;
        }
        .yoopta-editor .yoopta-block-menu {
          background-color: #333333 !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-block-menu button {
          color: #ffffff !important;
          background-color: transparent !important;
          border: none !important;
        }
        .yoopta-editor .yoopta-block-menu button:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-block-menu button.active {
          background-color: #666666 !important;
        }
        .yoopta-editor .yoopta-block-drag-handle {
          background-color: #333333 !important;
          border: none !important;
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block-drag-handle:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-block-drag-handle.active {
          background-color: #666666 !important;
        }
        .yoopta-editor .yoopta-block-plus {
          background-color: #333333 !important;
          border: none !important;
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block-plus:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-block-plus.active {
          background-color: #666666 !important;
        }
        .yoopta-editor .yoopta-block-menu-trigger {
          background-color: #333333 !important;
          border: none !important;
          color: #ffffff !important;
        }
        .yoopta-editor .yoopta-block-menu-trigger:hover {
          background-color: #555555 !important;
        }
        .yoopta-editor .yoopta-block-menu-trigger.active {
          background-color: #666666 !important;
        }
      `}</style>
      {/* 固定サイドバー */}
      <div
        style={{
          width: "320px",
          backgroundColor: "#000000",
          borderRight: "1px solid #333333",
          padding: "24px",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 10,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "24px",
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            borderBottom: "2px solid #333333",
            paddingBottom: "12px",
          }}
        >
          記事設定
        </h2>

        <ContentSelector
          selectedContentId={selectedContentId}
          onSelect={(contentId) => {
            console.log("=== ContentSelector onSelect called ===");
            console.log("contentId:", contentId);
            setSelectedContentId(contentId);
          }}
        />

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="title-input"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#ffffff",
            }}
          >
            タイトル
          </label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="記事のタイトル"
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "14px",
              border: "2px solid #333333",
              borderRadius: "8px",
              backgroundColor: "#111111",
              color: "#ffffff",
              transition: "border-color 0.2s, background-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#666666";
              e.target.style.backgroundColor = "#222222";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#333333";
              e.target.style.backgroundColor = "#111111";
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="slug-input"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#ffffff",
            }}
          >
            スラッグ
          </label>
          <input
            id="slug-input"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="page-slug"
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "14px",
              border: "2px solid #333333",
              borderRadius: "8px",
              backgroundColor: "#111111",
              color: "#ffffff",
              transition: "border-color 0.2s, background-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#666666";
              e.target.style.backgroundColor = "#222222";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#333333";
              e.target.style.backgroundColor = "#111111";
            }}
          />
        </div>

        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor:
                message.type === "success" ? "#222222" : "#333333",
              color: message.type === "success" ? "#ffffff" : "#cccccc",
            }}
          >
            {message.text}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "white",
              backgroundColor: saving ? "#9ca3af" : "#3b82f6",
              border: "none",
              borderRadius: "8px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "background-color 0.2s, transform 0.1s",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={handleNew}
            style={{
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: "#111111",
              border: "2px solid #333333",
              borderRadius: "8px",
              cursor: "pointer",
              transition:
                "border-color 0.2s, background-color 0.2s, transform 0.1s",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#666666";
              e.currentTarget.style.backgroundColor = "#222222";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#333333";
              e.currentTarget.style.backgroundColor = "#111111";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            新規
          </button>
        </div>

        <button
          type="button"
          onClick={handleLoadPage}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: "#111111",
            border: "2px solid #333333",
            borderRadius: "8px",
            cursor: "pointer",
            transition:
              "border-color 0.2s, background-color 0.2s, transform 0.1s",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
            marginBottom: "24px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#666666";
            e.currentTarget.style.backgroundColor = "#222222";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#333333";
            e.currentTarget.style.backgroundColor = "#111111";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          スラッグで読み込み
        </button>

        {selectedContentId && (
          <div>
            <h3>メディア一覧</h3>
            <div>
              {mediaList.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#888888",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                    📁
                  </div>
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    メディアがありません
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>
                    Yooptaエディタで画像や動画をアップロードしてください
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {mediaList.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      style={{
                        padding: "12px",
                        backgroundColor: "#1a1a1a",
                        borderRadius: "8px",
                        border: "1px solid #333333",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                        width: "100%",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2a2a2a";
                        e.currentTarget.style.borderColor = "#555555";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0, 0, 0, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#1a1a1a";
                        e.currentTarget.style.borderColor = "#333333";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onClick={() => {
                        const mediaUrl = getMediaUrl(
                          selectedContentId,
                          media.id
                        );
                        handleMediaInsert(mediaUrl);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: media.mimeType?.startsWith(
                              "image/"
                            )
                              ? "#2563eb"
                              : "#dc2626",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            color: "#ffffff",
                            flexShrink: 0,
                          }}
                        >
                          {media.mimeType?.startsWith("image/") ? "🖼️" : "🎬"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#ffffff",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: "4px",
                            }}
                          >
                            {media.filename}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888888",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span>{media.mimeType}</span>
                            <span>•</span>
                            <span>{(media.size / 1024).toFixed(1)}KB</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "#ffffff",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          opacity: 0.8,
                        }}
                      >
                        {media.mimeType?.startsWith("image/") ? "画像" : "動画"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginLeft: "320px",
          width: "calc(100% - 320px)",
          minHeight: "100vh",
          padding: "20px",
          backgroundColor: "#000000",
        }}
      >
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          tools={TOOLS}
          marks={MARKS}
          placeholder="テキストを入力するか、「/」でコマンドメニューを開く..."
          value={value}
          onChange={(newValue) => {
            console.log("Yoopta onChange triggered:", newValue);
            console.log("New value keys:", Object.keys(newValue));
            setValue(newValue);
          }}
          autoFocus={true}
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            minHeight: "600px",
            padding: "40px",
            color: "#ffffff",
          }}
        />
      </div>
    </>
  );
}
