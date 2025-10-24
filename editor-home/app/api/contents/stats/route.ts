import { getContentDbStats } from "@/app/lib/content-db-manager";

export const runtime = "nodejs";

// ========== GET: コンテンツデータベース統計取得 ==========
export async function GET() {
  try {
    const stats = getContentDbStats();
    return Response.json(stats);
  } catch (error) {
    console.error("GET /api/contents/stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
