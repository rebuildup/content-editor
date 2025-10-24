import {
  copyDatabase,
  createDatabase,
  deleteDatabase,
  getActiveDatabase,
  listDatabases,
  setActiveDatabase,
  updateDatabaseInfo,
} from "@/app/lib/db-manager";

export const runtime = "nodejs";

// ========== GET: データベース一覧取得 ==========
export async function GET() {
  try {
    const databases = listDatabases();
    const activeDb = getActiveDatabase();

    return Response.json({
      databases,
      activeDatabase: activeDb,
    });
  } catch (error) {
    console.error("GET /api/databases error:", error);
    return Response.json(
      { error: "Failed to fetch databases" },
      { status: 500 },
    );
  }
}

// ========== POST: データベース作成・コピー・切り替え ==========
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // データベース作成
    if (data.action === "create") {
      const success = createDatabase(data.id, data.name, data.description);
      if (!success) {
        return Response.json(
          { error: "Database already exists or invalid ID" },
          { status: 400 },
        );
      }
      return Response.json({ ok: true, id: data.id });
    }

    // データベースコピー
    if (data.action === "copy") {
      const success = copyDatabase(
        data.sourceId,
        data.targetId,
        data.name,
        data.description,
      );
      if (!success) {
        return Response.json(
          { error: "Failed to copy database" },
          { status: 400 },
        );
      }
      return Response.json({ ok: true, id: data.targetId });
    }

    // データベース切り替え
    if (data.action === "switch") {
      const success = setActiveDatabase(data.id);
      if (!success) {
        return Response.json({ error: "Database not found" }, { status: 404 });
      }
      return Response.json({ ok: true, activeDatabase: data.id });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/databases error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

// ========== PUT: データベース情報更新 ==========
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const success = updateDatabaseInfo(data.id, data.name, data.description);
    if (!success) {
      return Response.json({ error: "Database not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/databases error:", error);
    return Response.json(
      { error: "Failed to update database" },
      { status: 500 },
    );
  }
}

// ========== DELETE: データベース削除 ==========
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const success = deleteDatabase(id);
    if (!success) {
      return Response.json(
        { error: "Cannot delete active database or database not found" },
        { status: 400 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/databases error:", error);
    return Response.json(
      { error: "Failed to delete database" },
      { status: 500 },
    );
  }
}
