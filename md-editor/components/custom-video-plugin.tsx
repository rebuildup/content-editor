"use client";

import Video from "@yoopta/video";

export function createCustomVideoPlugin(contentId: string) {
  console.log("Video plugin created for contentId:", contentId);

  const customPlugin = Video.extend({
    options: {
      onUpload: async (file: File) => {
        console.log("Video upload started:", file.name, file.type, file.size);

        try {
          const videoUrl = URL.createObjectURL(file);
          console.log("Video URL created:", videoUrl);

          const result = {
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

          console.log("Video plugin returning:", result);
          return result;
        } catch (error) {
          console.error("Video upload failed:", error);
          throw new Error(
            `動画の処理に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
          );
        }
      },
      onError: (error: Error) => {
        console.error("Video plugin error:", error);
        alert(
          `動画のアップロードに失敗しました: ${error.message || "不明なエラー"}`,
        );
      },
    },
  });

  return customPlugin;
}
