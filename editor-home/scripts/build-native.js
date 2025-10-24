#!/usr/bin/env node

/**
 * ネイティブモジュールの自動ビルドスクリプト
 * better-sqlite3のバイナリファイルを確実にビルドします
 */

const { execSync } = require("node:child_process");

console.log("🔧 ネイティブモジュールをビルド中...");

try {
  // better-sqlite3を再ビルド
  console.log("📦 better-sqlite3を再ビルド中...");
  execSync("pnpm rebuild better-sqlite3", { stdio: "inherit" });

  // ビルド結果を確認
  console.log("✅ ビルド完了");

  // 動作テスト
  console.log("🧪 動作テスト中...");
  const Database = require("better-sqlite3");
  const testDb = new Database(":memory:");
  testDb.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
  testDb.exec('INSERT INTO test (name) VALUES ("test")');
  const result = testDb.prepare("SELECT * FROM test").all();
  testDb.close();

  console.log("✅ better-sqlite3が正常に動作しています");
  console.log("📊 テスト結果:", result);
} catch (error) {
  console.error("❌ ビルドエラー:", error.message);
  process.exit(1);
}
