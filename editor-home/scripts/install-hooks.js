#!/usr/bin/env node

/**
 * インストールフックスクリプト
 * better-sqlite3のインストール時に自動でビルドを実行
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

console.log("🔧 インストールフックを実行中...");

// better-sqlite3がインストールされているかチェック
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (packageJson.dependencies?.["better-sqlite3"]) {
  console.log("📦 better-sqlite3が検出されました。自動ビルドを開始...");

  try {
    // better-sqlite3を再ビルド（複数の方法を試行）
    console.log("🔨 方法1: pnpm rebuild...");
    execSync("pnpm rebuild better-sqlite3", { stdio: "inherit" });

    // 動作確認
    console.log("🧪 動作確認中...");
    const Database = require("better-sqlite3");
    const testDb = new Database(":memory:");
    testDb.close();

    console.log("✅ better-sqlite3の自動ビルド完了！");
  } catch (_error) {
    console.log("🔄 方法1が失敗、方法2を試行中...");
    try {
      // 代替方法: npm rebuild
      execSync("npm rebuild better-sqlite3", { stdio: "inherit" });

      // 動作確認
      console.log("🧪 動作確認中...");
      const Database = require("better-sqlite3");
      const testDb = new Database(":memory:");
      testDb.close();

      console.log("✅ better-sqlite3の自動ビルド完了！");
    } catch (_error2) {
      console.log("🔄 方法2が失敗、方法3を試行中...");
      try {
        // 最終手段: 手動ビルド
        execSync("node -e \"require('better-sqlite3')\"", { stdio: "inherit" });
        console.log("✅ better-sqlite3が利用可能です！");
      } catch (error3) {
        console.error("❌ 全ての自動ビルド方法が失敗しました");
        console.error("❌ エラー:", error3.message);
        console.log("💡 手動でビルドを実行してください: pnpm run build:native");
      }
    }
  }
} else {
  console.log("ℹ️ better-sqlite3が見つかりません。スキップします。");
}
