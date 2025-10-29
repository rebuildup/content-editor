export const runtime = "nodejs";

function extractMeta(content: string, url: URL) {
    // Try common OG/Twitter meta tags and link tags
    const patterns = [
        /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<link[^>]+rel=["'](?:image_src|icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    ];

    for (const regex of patterns) {
        const match = content.match(regex);
        if (match?.[1]) {
            try {
                const candidate = match[1].trim();
                const absolute = new URL(candidate, url).toString();
                return { image: absolute };
            } catch {
                // ignore invalid URL
            }
        }
    }
    // Title: prefer og:title then <title>
    let title = "";
    const ogTitle =
        content.match(
            /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        ) ||
        content.match(
            /<meta[^>]+name=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        );
    if (ogTitle?.[1]) {
        title = ogTitle[1].trim();
    } else {
        const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch?.[1]) {
            title = titleMatch[1].trim();
        }
    }

    // Description: prefer og:description then meta description
    let description = "";
    const ogDesc =
        content.match(
            /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        ) ||
        content.match(
            /<meta[^>]+name=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        ) ||
        content.match(
            /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        );
    if (ogDesc?.[1]) {
        description = ogDesc[1].trim();
    }

    return { image: "", title, description };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const target = searchParams.get("url")?.trim();
        if (!target) {
            return Response.json({ error: "url is required" }, { status: 400 });
        }
        let targetUrl: URL;
        try {
            targetUrl = new URL(target);
            if (!/^https?:$/.test(targetUrl.protocol)) {
                return Response.json(
                    { error: "unsupported protocol" },
                    { status: 400 },
                );
            }
        } catch {
            return Response.json({ error: "invalid url" }, { status: 400 });
        }

        const resp = await fetch(targetUrl.toString(), {
            redirect: "follow",
            headers: {
                // Hint servers to return HTML
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            },
        });
        if (!resp.ok) {
            return Response.json({ image: "" });
        }
        const html = await resp.text();
        const { image, title, description } = extractMeta(html, targetUrl);
        return Response.json({ image, title, description });
    } catch (error) {
        console.error("GET /api/metadata error:", error);
        return Response.json({ image: "", title: "", description: "" });
    }
}

export function OPTIONS() {
    return Response.json(
        {},
        {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        },
    );
}
