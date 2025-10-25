"use client";

import Video from "@yoopta/video";

export function createCustomVideoPlugin(contentId: string) {
  console.log("=== createCustomVideoPlugin called ===");
  console.log("contentId:", contentId);

  // Yooptaエディタのプラグインのextendメソッドを使用してオプションを設定
  const customPlugin = Video.extend({
    options: {
      onUpload: async (file: File) => {
        try {
          console.log("=== Custom Video Plugin Upload ===");
          console.log("Uploading video file:", file.name);
          console.log("File type:", file.type);
          console.log("File size:", file.size);
          console.log("Content ID:", contentId);

          // 動画の場合はObjectURLを生成
          const videoUrl = URL.createObjectURL(file);
          console.log("Video URL generated:", videoUrl);

          return {
            src: videoUrl,
            sizes: {
              width: 640,
              height: 360,
            },
            settings: {
              controls: true,
              loop: false,
              muted: false,
              autoPlay: false,
            },
          };
        } catch (error) {
          console.error("Failed to process video:", error);
          throw new Error(
            `動画の処理に失敗しました: ${
              error instanceof Error ? error.message : "不明なエラー"
            }`
          );
        }
      },
      onError: (error: Error) => {
        console.error("Video plugin error:", error);
        alert(
          `動画のアップロードに失敗しました: ${error.message || "不明なエラー"}`
        );
      },
    },
  });

  console.log("=== Custom Video Plugin created ===");
  console.log("Plugin:", customPlugin);

  return customPlugin;
}
