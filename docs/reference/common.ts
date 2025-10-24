/**
 * 共通型定義 / Common type definitions
 * 超汎用的・最適化された構造 / Highly generic and optimized
 */

export type ISODate = string;

/**
 * アセット参照（サムネ系の統合）/ Asset reference (unified for thumbnails)
 */
export interface AssetRef {
	/** URL or path / リソースのURLまたはパス */
	src: string;
	/** MIME type / MIMEタイプ */
	type?: string;
	/** 幅 / Width */
	width?: number;
	/** 高さ / Height */
	height?: number;
	/** 代替テキスト / Alt text */
	alt?: string;
	/** メタデータ（lqip, focalPoint など任意）/ Optional metadata */
	meta?: Record<string, unknown>;
}

/**
 * サムネイルバリアント（image/gif/webmを明示）/ Thumbnail variants
 */
export interface ThumbnailVariants {
	/** 静止: jpg/png/webp 等 / Still image */
	image?: AssetRef;
	/** アニメ: gif / Animated GIF */
	gif?: AssetRef;
	/** 動画: webm(+poster) / Video (webm + poster) */
	webm?: AssetRef & { poster?: string };
	/** 既定の選好順 / Preferred order */
	prefer?: Array<"webm" | "gif" | "image">;
}

/**
 * コンテンツリンク（URLの正規化）/ Content link (normalized URL)
 */
export interface ContentLink {
	/** URL / リンク先URL */
	href: string;
	/** ラベル / Label */
	label?: string;
	/** 関係性 / Relationship */
	rel?: "canonical" | "alternate" | "external" | string;
	/** 主リンクフラグ / Primary link flag */
	primary?: boolean;
	/** 説明 / Description */
	description?: string;
}

/**
 * コンテンツリレーション / Content relation edge
 */
export interface ContentRelation {
	/** 関連先ID / Target content id */
	targetId: string;
	/** 関係性タイプ / Relation type */
	type:
		| "related"
		| "prerequisite"
		| "series"
		| "reference"
		| "translation"
		| string;
	/** 双方向フラグ / Bidirectional relation */
	bidirectional?: boolean;
	/** 重み / Weight for ranking */
	weight?: number;
	/** メタデータ / Optional metadata */
	meta?: Record<string, unknown>;
}

/**
 * 検索オプション / Search options
 */
export interface SearchOptions {
	/** 最小スコア / Minimum score */
	minScore?: number;
	/** 結果数制限 / Maximum number of results */
	limit?: number;
	/** オフセット / Offset for pagination */
	offset?: number;
	/** フィルター / Arbitrary filters */
	filters?: Record<string, unknown>;
	/** ソート / Sorting rules */
	sort?: {
		field: string; // ソート対象フィールド / Field name
		direction: "asc" | "desc"; // 昇順/降順 / Asc/Desc
	}[];
}

/**
 * 検索結果 / Search result entry
 */
export interface SearchResult {
	/** コンテンツID / Content id */
	contentId: string;
	/** 関連度スコア / Relevance score */
	score: number;
	/** ハイライト / Highlight snippets */
	highlights?: string[];
	/** マッチしたフィールド / Matched fields */
	matchedFields?: string[];
}
