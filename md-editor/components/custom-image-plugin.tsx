"use client";

import type { YooptaPlugin } from "@yoopta/editor";
import Image from "@yoopta/image";

export function createCustomImagePlugin(contentId: string) {
  console.log("=== createCustomImagePlugin called ===");
  console.log("contentId:", contentId);

  // Yooptaエディタのプラグインを拡張
  // extendメソッドを使用してオプションを設定
  const customPlugin = Image.extend({
    options: {
      onUpload: async (file: File) => {
        try {
          console.log("=== Custom Image Plugin Upload ===");
          console.log("Uploading media file:", file.name);
          console.log("File type:", file.type);
          console.log("File size:", file.size);
          console.log("Content ID:", contentId);
          console.log("Starting upload process...");

          // 画像の場合はDataURLを生成してローカル表示
          if (file.type.startsWith("image/")) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                console.log(
                  "Local data URL generated:",
                  `${dataUrl.substring(0, 50)}...`
                );

                const img = new window.Image();
                img.onload = () => {
                  console.log(
                    "Image loaded successfully:",
                    img.width,
                    "x",
                    img.height
                  );
                  resolve({
                    src: dataUrl, // DataURLを返す
                    alt: file.name,
                    sizes: {
                      width: img.width,
                      height: img.height,
                    },
                  });
                };
                img.onerror = (error) => {
                  console.error("Failed to load image:", error);
                  reject(new Error("画像の読み込みに失敗しました"));
                };
                img.src = dataUrl;
              };
              reader.onerror = (error) => {
                console.error("Failed to read file:", error);
                reject(new Error("ファイルの読み込みに失敗しました"));
              };
              reader.readAsDataURL(file);
            });
          }

          // 動画の場合はデフォルトサイズ
          return {
            src: URL.createObjectURL(file),
            alt: file.name,
            sizes: {
              width: 640,
              height: 360,
            },
          };
        } catch (error) {
          console.error("Failed to process media:", error);
          console.error("Error details:", {
            message: error instanceof Error ? error.message : "不明なエラー",
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
          });
          throw new Error(
            `メディアの処理に失敗しました: ${
              error instanceof Error ? error.message : "不明なエラー"
            }`
          );
        }
      },
      onError: (error: Error) => {
        console.error("Image plugin error:", error);
        alert(
          `画像のアップロードに失敗しました: ${error.message || "不明なエラー"}`
        );
      },
    },
  }) as any;

  console.log("=== Custom Image Plugin created ===");
  console.log("Plugin:", customPlugin);
  console.log("Plugin type:", typeof customPlugin);
  console.log("Plugin constructor:", customPlugin.constructor.name);

  return customPlugin;
}
