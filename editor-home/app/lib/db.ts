import path from "path";
import Database from 'better-sqlite3';
const dbPath = path.join(process.cwd(), "data", "content.db");
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
    CREATE TABLE IF NOT EXISTS contents (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     body_md TEXT NOT NULL,
     created_at TEXT NOT NULL
    );
    `);

export default db;