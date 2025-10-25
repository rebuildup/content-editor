"use client";

import type { MarkdownPage } from "@/types/markdown";

interface ArticleListProps {
  articles: MarkdownPage[];
  selectedArticleId?: string;
  isLoading?: boolean;
  onSelect: (page: MarkdownPage) => void;
  onEdit: (page: MarkdownPage) => void;
  onNew: () => void;
}

export function ArticleList({
  articles,
  selectedArticleId,
  isLoading = false,
  onSelect,
  onEdit,
  onNew,
}: ArticleListProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          記事一覧
        </h3>
        <button
          type="button"
          onClick={onNew}
          style={{
            padding: "6px 10px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3b82f6";
          }}
        >
          新規作成
        </button>
      </div>

      <div
        style={{
          maxHeight: "320px",
          overflowY: "auto",
        }}
      >
        {isLoading ? (
          <p
            style={{
              textAlign: "center",
              color: "#888888",
              margin: "12px 0",
            }}
          >
            読み込み中...
          </p>
        ) : articles.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#888888",
              margin: "12px 0",
            }}
          >
            記事がありません
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {articles.map((article) => {
              const isActive = article.id === selectedArticleId;
              return (
                <li
                  key={article.id}
                  style={{
                    backgroundColor: isActive ? "#1f2937" : "transparent",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(article)}
                    style={{
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#ffffff",
                        marginBottom: "2px",
                      }}
                    >
                      {article.frontmatter.title || "（無題）"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#bbbbbb",
                      }}
                    >
                      {article.slug}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(article)}
                    style={{
                      padding: "4px 6px",
                      fontSize: "11px",
                      border: "1px solid #3b82f6",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      color: "#3b82f6",
                      cursor: "pointer",
                      marginTop: "6px",
                    }}
                  >
                    設定を編集
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
