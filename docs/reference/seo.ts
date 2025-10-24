/**
 * SEO最適化データ構造 / SEO optimized data model
 * 多言語対応・超汎用的な構造 / Multilingual, highly generic
 */

/**
 * SEO最適化構成 / SEO configuration
 */
export interface SEO {
	/** メタ情報 / Meta tags */
	meta?: {
		/** タイトル / Title */
		title?: string;
		/** 説明 / Description */
		description?: string;
		/** キーワード / Keywords */
		keywords?: string[];
		/** ロボット / Robots directives */
		robots?: string;
		/** カノニカルURL / Canonical URL */
		canonical?: string;
		/** 言語 / Language */
		lang?: string;
		/** 地域 / Locale */
		locale?: string;
	};
	/** オープングラフ / Open Graph tags */
	openGraph?: {
		/** タイプ / Type */
		type?:
			| "website"
			| "article"
			| "video.other"
			| "book"
			| "music.song"
			| string;
		/** タイトル / Title */
		title?: string;
		/** 説明 / Description */
		description?: string;
		/** 画像（1200x630推奨）/ Image (1200x630 recommended) */
		image?: string;
		/** 画像の幅 / Image width */
		imageWidth?: number;
		/** 画像の高さ / Image height */
		imageHeight?: number;
		/** サイト名 / Site name */
		siteName?: string;
		/** URL / Canonical URL */
		url?: string;
		/** 地域 / Locale */
		locale?: string;
	};
	/** Twitter Card / Twitter card tags */
	twitter?: {
		/** カードタイプ / Card type */
		card?: "summary" | "summary_large_image" | "app" | "player";
		/** サイト / Site */
		site?: string;
		/** 作成者 / Creator */
		creator?: string;
		/** タイトル / Title */
		title?: string;
		/** 説明 / Description */
		description?: string;
		/** 画像 / Image */
		image?: string;
	};
	/** JSON-LD構造化データ / JSON-LD structured data */
	jsonLd?: Array<Record<string, unknown>>;
	/** 多言語対応 / Internationalization */
	i18n?: {
		/** 代替言語 / Alternate languages */
		alternateLanguages?: Array<{
			/** 言語コード / Language code */
			lang: string;
			/** URL / Canonical URL */
			url: string;
		}>;
		/** hreflang / hreflang mapping */
		hreflang?: Record<string, string>;
	};
	/** パフォーマンス最適化 / Performance hints */
	performance?: {
		/** プリロード / Preload resources */
		preload?: Array<{
			/** リソース / Resource href */
			href: string;
			/** タイプ / As type */
			as: "script" | "style" | "image" | "font" | string;
		}>;
		/** プリコネクト / Preconnect origins */
		preconnect?: string[];
		/** DNS プリフェッチ / DNS prefetch origins */
		dnsPrefetch?: string[];
	};
}
