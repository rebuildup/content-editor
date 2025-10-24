/**
 * データベース管理機能
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { DatabaseInfo, DatabaseStats } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "db-config.json");
const DEFAULT_DB = "content.db";

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ========== 設定管理 ==========

interface DbConfig {
  activeDatabase: string;
  databases: Record<
    string,
    {
      name: string;
      description?: string;
      createdAt: string;
    }
  >;
}

function loadConfig(): DbConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig: DbConfig = {
      activeDatabase: DEFAULT_DB,
      databases: {
        [DEFAULT_DB]: {
          name: "デフォルトデータベース",
          description: "メインのコンテンツデータベース",
          createdAt: new Date().toISOString(),
        },
      },
    };
    saveConfig(defaultConfig);
    return defaultConfig;
  }

  const content = fs.readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(content);
}

function saveConfig(config: DbConfig): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

// ========== アクティブデータベース管理 ==========

export function getActiveDatabase(): string {
  const config = loadConfig();
  return config.activeDatabase;
}

export function setActiveDatabase(dbId: string): boolean {
  const config = loadConfig();

  const dbPath = path.join(DATA_DIR, dbId);
  if (!fs.existsSync(dbPath)) {
    return false;
  }

  config.activeDatabase = dbId;
  saveConfig(config);
  return true;
}

// ========== データベース一覧 ==========

export function listDatabases(): DatabaseInfo[] {
  const config = loadConfig();
  const databases: DatabaseInfo[] = [];

  if (!fs.existsSync(DATA_DIR)) {
    return databases;
  }

  const files = fs.readdirSync(DATA_DIR);

  for (const file of files) {
    if (!file.endsWith(".db")) continue;

    const filePath = path.join(DATA_DIR, file);
    const stats = fs.statSync(filePath);
    const dbInfo = config.databases[file];

    databases.push({
      id: file,
      name: dbInfo?.name || file.replace(".db", ""),
      description: dbInfo?.description || "",
      path: filePath,
      createdAt: dbInfo?.createdAt || stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      size: stats.size,
      isActive: file === config.activeDatabase,
    });
  }

  return databases.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ========== データベース作成 ==========

export function createDatabase(
  id: string,
  name: string,
  description?: string,
): boolean {
  const config = loadConfig();

  // IDのバリデーション
  if (!id.endsWith(".db")) {
    id = `${id}.db`;
  }

  // ファイル名のサニタイズ
  const sanitizedId = id.replace(/[^a-zA-Z0-9._-]/g, "_");
  const dbPath = path.join(DATA_DIR, sanitizedId);

  if (fs.existsSync(dbPath)) {
    return false; // 既に存在する
  }

  // 新しいデータベースを作成（空のDBファイル）
  const db = new Database(dbPath);
  db.close();

  // 設定に追加
  config.databases[sanitizedId] = {
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  saveConfig(config);

  return true;
}

// ========== データベース削除 ==========

export function deleteDatabase(dbId: string): boolean {
  const config = loadConfig();

  // アクティブなデータベースは削除できない
  if (dbId === config.activeDatabase) {
    return false;
  }

  const dbPath = path.join(DATA_DIR, dbId);

  if (!fs.existsSync(dbPath)) {
    return false;
  }

  // データベースファイルとWALファイルを削除
  fs.unlinkSync(dbPath);

  const walPath = `${dbPath}-wal`;
  if (fs.existsSync(walPath)) {
    fs.unlinkSync(walPath);
  }

  const shmPath = `${dbPath}-shm`;
  if (fs.existsSync(shmPath)) {
    fs.unlinkSync(shmPath);
  }

  // 設定から削除
  delete config.databases[dbId];
  saveConfig(config);

  return true;
}

// ========== データベースコピー ==========

export function copyDatabase(
  sourceId: string,
  targetId: string,
  name: string,
  description?: string,
): boolean {
  const config = loadConfig();

  // ターゲットIDのサニタイズ
  if (!targetId.endsWith(".db")) {
    targetId = `${targetId}.db`;
  }
  const sanitizedTargetId = targetId.replace(/[^a-zA-Z0-9._-]/g, "_");

  const sourcePath = path.join(DATA_DIR, sourceId);
  const targetPath = path.join(DATA_DIR, sanitizedTargetId);

  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  if (fs.existsSync(targetPath)) {
    return false; // 既に存在する
  }

  // ファイルをコピー
  fs.copyFileSync(sourcePath, targetPath);

  // 設定に追加
  config.databases[sanitizedTargetId] = {
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  saveConfig(config);

  return true;
}

// ========== データベース統計 ==========

export function getDatabaseStats(dbId: string): DatabaseStats | null {
  const dbPath = path.join(DATA_DIR, dbId);

  if (!fs.existsSync(dbPath)) {
    return null;
  }

  try {
    const db = new Database(dbPath, { readonly: true });

    const contentsCount = db
      .prepare("SELECT COUNT(*) as count FROM contents")
      .get() as { count: number };
    const markdownPagesCount = db
      .prepare("SELECT COUNT(*) as count FROM markdown_pages")
      .get() as { count: number };
    const tagsCount = db
      .prepare("SELECT COUNT(DISTINCT tag) as count FROM content_tags")
      .get() as { count: number };

    const stats = fs.statSync(dbPath);

    db.close();

    return {
      id: dbId,
      contentsCount: contentsCount.count,
      markdownPagesCount: markdownPagesCount.count,
      tagsCount: tagsCount.count,
      fileSize: stats.size,
      lastUpdated: stats.mtime.toISOString(),
    };
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return null;
  }
}

// ========== データベース情報更新 ==========

export function updateDatabaseInfo(
  dbId: string,
  name: string,
  description?: string,
): boolean {
  const config = loadConfig();

  if (!config.databases[dbId]) {
    return false;
  }

  config.databases[dbId].name = name;
  config.databases[dbId].description = description;
  saveConfig(config);

  return true;
}
