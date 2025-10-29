import type { NextRequest } from "next/server";
import { getMedia } from "@/app/lib/media-manager";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ contentId: string; id: string }> },
) {
  try {
    const { contentId, id } = await context.params;

    if (!contentId || !id) {
      return new Response("Missing contentId or id", {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const media = getMedia(contentId, id);

    if (!media || !media.data) {
      return new Response("Media not found", {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    const buffer = media.data;
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(buffer);
    const filename = media.filename ?? `${id}`;
    const mimeType = media.mimeType || "application/octet-stream";
    const contentLength = media.size ?? buffer.byteLength;

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": mimeType,
        "Content-Length": String(contentLength),
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("GET /api/media/[contentId]/[id] error:", error);
    return new Response("Failed to load media", {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
