/**
 * コンテンツデータ管理の型定義 / Content data model
 * 超汎用的・最適化された構造 / Highly generic and optimized structure
 */

import type {
	AssetRef,
	ContentLink,
	ContentRelation,
	ISODate,
	ThumbnailVariants,
} from "./common";
import type { SEO } from "./seo";

/**
 * 最適化されたコンテンツ型定義 / Optimized Content interface
 */
export interface Content {
	// ========== コア（必須） ==========
	/** ID / Unique identifier */
	id: string;
	/** タイトル / Human-readable title */
	title: string;
	/** 公開URL / Public canonical URL */
	publicUrl?: string;

	// ========== 基本情報 ==========
	/** 要約 / Short summary */
	summary?: string;
	/** タグ / Free-form tags */
	tags?: string[];
	/** 言語コード（ISO 639-1）/ Language code (ISO 639-1) */
	lang?: string;

	// ========== メディア ==========
	/** サムネイルバリアント / Thumbnail variants */
	thumbnails?: ThumbnailVariants;
	/** アセット参照 / Asset references (gallery, downloads, embeds) */
	assets?: AssetRef[];
	/** 補助リンク / Secondary/external links */
	links?: ContentLink[];

	// ========== ツリー構造（最適化） ==========
	/** 親ID / Parent node id */
	parentId?: string;
	/** 祖先パス（クエリ最適化用）/ Ancestor ids for fast queries */
	ancestorIds?: string[];
	/** URLパス / Logical URL path */
	path?: string;
	/** 深さ（0始まり）/ Depth from root (0-based) */
	depth?: number;
	/** 並び順 / Sibling order */
	order?: number;
	/** 子の数（キャッシュ）/ Number of children (cached) */
	childCount?: number;

	// ========== 状態と公開 ==========
	/** 公開範囲 / Visibility scope */
	visibility?: "public" | "unlisted" | "private" | "draft";
	/** 状態 / Lifecycle status */
	status?: "draft" | "published" | "archived";
	/** 公開日時 / Publish datetime (ISO 8601) */
	publishedAt?: ISODate;
	/** 非公開日時 / Unpublish datetime (ISO 8601) */
	unpublishedAt?: ISODate;

	// ========== 検索・インデックス（明確化） ==========
	/** 検索可能データ / Searchable projection and tokens */
	searchable?: {
		/** 全文検索用テキスト / Flattened full-text index */
		fullText?: string;
		/** トークン化済みキーワード / Pre-tokenized keywords */
		tokens?: string[];
		/** 重み付けフィールド / Weighted fields for ranking */
		weighted?: {
			high: string[]; // タイトル、主要キーワード / title, primary keywords
			medium: string[]; // 要約、タグ / summary, tags
			low: string[]; // 本文、メタ情報 / body, meta
		};
	};

	// ========== リレーション ==========
	/** 関連コンテンツ / Content graph relationships */
	relations?: ContentRelation[];

	// ========== 多言語対応 ==========
	/** 国際化情報 / Internationalization info */
	i18n?: {
		/** デフォルト言語 / Default language */
		defaultLang: string;
		/** 翻訳マップ / Lang -> translated content id */
		translations?: Record<string, string>;
		/** 翻訳可能フィールド / Localizable field keys */
		localizable?: ("title" | "summary" | string)[];
	};

	// ========== バージョニング ==========
	/** バージョン番号 / Current version number */
	version?: number;
	/** バージョン管理 / Versioning links */
	versioning?: {
		/** 最新バージョンID / Latest version id */
		latestId?: string;
		/** 前バージョンID / Previous version id */
		previousId?: string;
		/** バージョン履歴参照 / History storage reference */
		historyRef?: string;
	};

	// ========== アクセス制御 ==========
	/** アクセス権限 / Access permissions */
	permissions?: {
		/** 閲覧可能ユーザー/グループ / Readers (users/groups) */
		readers?: string[];
		/** 編集可能ユーザー/グループ / Editors (users/groups) */
		editors?: string[];
		/** 所有者 / Owner */
		owner?: string;
	};

	// ========== SEO ==========
	/** SEO情報 / SEO data */
	seo?: SEO;

	// ========== キャッシュ（明示化） ==========
	/** キャッシュデータ（揮発性）/ Volatile cache (non-persistent) */
	cache?: {
		/** 最終計算日時 / Last computed at */
		computedAt?: ISODate;
		/** TTL（秒）/ Time-to-live in seconds */
		ttl?: number;
		/** 導出データ / Derived metrics */
		derived?: {
			/** 読了時間（分）/ Estimated reading time (minutes) */
			readingTime?: number;
			/** 人気スコア / Popularity score */
			popularityScore?: number;
			/** 関連度マップ / Relevance map */
			relevanceMap?: Record<string, number>;
		};
	};

	// ========== 非可読データ（検索対象外） ==========
	/** 非可読データ / Non-readable (excluded from search) */
	private?: {
		/** 管理用メモ / Internal notes */
		internalNotes?: string;
		/** 編集履歴 / Edit history */
		editHistory?: EditHistoryEntry[];
		/** アクセス統計（キャッシュ）/ Analytics (cached) */
		analytics?: Record<string, unknown>;
	};

	// ========== タイムスタンプ（一貫性） ==========
	/** 作成日時 / Created at (ISO 8601) */
	createdAt?: ISODate;
	/** 更新日時 / Updated at (ISO 8601) */
	updatedAt?: ISODate;
	/** 最終アクセス日時 / Last accessed at (ISO 8601) */
	lastAccessedAt?: ISODate;

	// ========== 拡張（必要時だけ伸ばす） ==========
	/** 衝突しない拡張 / Non-conflicting extensions */
	ext?: Record<string, unknown>;
}

// ========== 補助型定義 ==========

/**
 * 編集履歴エントリ / Edit history entry
 */
export interface EditHistoryEntry {
	/** 編集日時 / Edited at */
	editedAt: ISODate;
	/** 編集者 / Editor */
	editor: string;
	/** 変更内容 / Change summary list */
	changes: string[];
	/** バージョン / Version number at edit */
	version: number;
}

// ========== ユーティリティ ==========

/**
 * 一覧/カードで使うサムネ選択（省データ/低性能にも配慮）
 * Thumbnail picker for list/card views with data/motion preferences
 */
export function pickThumbnail(
	tv: ThumbnailVariants | undefined,
	opts?: {
		hoverPlayable?: boolean;
		saveData?: boolean;
		prefersReducedMotion?: boolean;
	},
):
	| { kind: "image" | "gif" | "webm"; asset: AssetRef; poster?: string }
	| undefined {
	if (!tv) return;
	const order = tv.prefer ?? ["webm", "gif", "image"];
	const canAnimate = !(opts?.saveData || opts?.prefersReducedMotion);

	for (const kind of order) {
		const a = (tv as any)[kind] as AssetRef | undefined;
		if (!a) continue;
		if (kind === "webm") {
			if (tv.webm && canAnimate && opts?.hoverPlayable) {
				return { kind: "webm", asset: tv.webm, poster: tv.webm.poster };
			}
			if (tv.webm?.poster)
				return { kind: "image", asset: { src: tv.webm.poster } as AssetRef };
			continue;
		}
		if (kind === "gif" && canAnimate) return { kind: "gif", asset: a };
		if (kind === "image") return { kind: "image", asset: a };
	}
	return tv.image
		? { kind: "image", asset: tv.image }
		: tv.gif && canAnimate
		? { kind: "gif", asset: tv.gif }
		: undefined;
}

/**
 * canonical の最終決定（seo.meta.canonical が無ければ publicUrl）
 * Resolve canonical URL (fallback to publicUrl)
 */
export function resolveCanonical(c: Content): string {
	return c.seo?.meta?.canonical ?? c.publicUrl ?? "";
}

/**
 * パンくず配列の生成（必要なら path から分解）
 * Build breadcrumb array from path
 */
export function breadcrumbFromPath(path?: string): string[] {
	if (!path) return [];
	return path
		.split("/")
		.filter(Boolean)
		.map((_, i, arr) => `/${arr.slice(0, i + 1).join("/")}`);
}

/**
 * 検索投影（可読/不可読の設計はここで調整する）
 * Build flattened index text from readable fields
 */
export function buildIndexText(c: Content): string {
	const parts = [
		c.title,
		c.summary ?? "",
		...(c.tags ?? []),
		// 追加で ext 側の公開テキスト等があればここで吸い上げる
	];
	return parts.filter(Boolean).join("\n");
}

// ========== 検索・フィルター関連 ==========

/**
 * コンテンツフィルター
 */
export interface ContentFilter {
	/** タグ */
	tags?: string[];
	/** 作成日範囲 */
	dateRange?: {
		start: Date;
		end: Date;
	};
	/** 検索キーワード */
	searchKeyword?: string;
	/** 状態フィルター */
	status?: ("draft" | "published" | "archived")[];
}

/**
 * コンテンツ検索結果
 */
export interface ContentSearchResult {
	/** 検索結果 */
	contents: Content[];
	/** 総数 */
	total: number;
	/** ページネーション情報 */
	pagination: {
		page: number;
		limit: number;
		totalPages: number;
	};
	/** 検索時間（ミリ秒） */
	searchTime: number;
	/** 検索クエリ */
	query: string;
}

// ========== 統計・分析関連 ==========

/**
 * コンテンツ統計
 */
export interface ContentStats {
	/** 総コンテンツ数 */
	total: number;
	/** 月別作成統計 */
	monthlyCreated: Record<string, number>;
	/** 人気コンテンツ（閲覧数順） */
	popularContent: Content[];
	/** 最近更新されたコンテンツ */
	recentlyUpdated: Content[];
	/** 状態別統計 */
	byStatus: Record<string, number>;
	/** タグ別統計 */
	byTag: Record<string, number>;
}

// ========== コレクション・グループ関連 ==========

/**
 * コンテンツコレクション
 */
export interface ContentCollection {
	/** ID */
	id: string;
	/** 名前 */
	name: string;
	/** 説明 */
	description: string;
	/** コンテンツ一覧 */
	contents: Content[];
	/** 作成日 */
	createdAt: Date;
	/** 更新日 */
	updatedAt: Date;
	/** 公開設定 */
	isPublic: boolean;
	/** タグ */
	tags: string[];
}

/**
 * コンテンツツリー構造
 */
export interface ContentTree {
	/** ルート */
	root: Content;
	/** 子 */
	children: ContentTree[];
	/** 深さ */
	depth: number;
	/** パス */
	breadcrumbPath: string[];
}
