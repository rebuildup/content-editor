"use client";

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          メディア管理
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          メディア管理機能は現在準備中です
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
          >
            ← コンテンツ管理
          </a>
          <a
            href="/markdown"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
          >
            ← Markdownページ管理
          </a>
          <a
            href="/databases"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 focus:bg-secondary-200"
          >
            → データベース管理
          </a>
        </div>
      </div>
    </div>
  );
}
