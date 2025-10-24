import { getDatabaseStats } from "@/app/lib/db-manager";

export const runtime = "nodejs";

// ========== GET: データベース統計取得 ==========
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const stats = getDatabaseStats(id);
    if (!stats) {
      return Response.json({ error: "Database not found" }, { status: 404 });
    }

    return Response.json(stats);
  } catch (error) {
    console.error("GET /api/databases/stats error:", error);
    return Response.json(
      { error: "Failed to fetch database stats" },
      { status: 500 },
    );
  }
}
