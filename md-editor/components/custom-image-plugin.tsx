"use client";

import Image from "@yoopta/image";

export function createCustomImagePlugin(contentId: string) {
  console.log("Image plugin created for contentId:", contentId);

  const customPlugin = Image.extend({
    options: {
      onUpload: async (file: File) => {
        console.log("Image upload started:", file.name, file.type);

        try {
          // 画像の場合はDataURLを生成してローカル表示
          if (file.type.startsWith("image/")) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                console.log("Image data URL created");

                const img = new window.Image();
                img.onload = () => {
                  console.log("Image loaded:", img.width, "x", img.height);
                  resolve({
                    src: dataUrl,
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

          // デフォルトサイズ
          return {
            src: URL.createObjectURL(file),
            alt: file.name,
            sizes: {
              width: 640,
              height: 360,
            },
          };
        } catch (error) {
          console.error("Image upload failed:", error);
          throw new Error(
            `メディアの処理に失敗しました: ${
              error instanceof Error ? error.message : "不明なエラー"
            }`,
          );
        }
      },
      onError: (error: Error) => {
        console.error("Image plugin error:", error);
        alert(
          `画像のアップロードに失敗しました: ${error.message || "不明なエラー"}`,
        );
      },
    },
  });

  return customPlugin;
}
