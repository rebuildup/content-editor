"use client";

import Video from "@yoopta/video";

// YouTube動画IDを抽出する関数
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

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
    // カスタムレンダラーをoptions内に設定
    render: (props: any) => {
      console.log("Video render called with props:", props);
      const { src, sizes, settings } = props;
      
      if (!src) {
        console.warn("Video src is missing:", props);
        return null;
      }

      console.log("Rendering video with src:", src, "sizes:", sizes, "settings:", settings);
      
      // YouTube URLの場合は埋め込み用のiframeに変換
      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        const videoId = extractYouTubeVideoId(src);
        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          console.log("Converting YouTube URL to embed:", embedUrl);
          
          return (
            <iframe
              src={embedUrl}
              width={sizes?.width || 640}
              height={sizes?.height || 360}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                width: "100%",
                maxWidth: sizes?.width || 640,
                height: "auto",
                aspectRatio: "16/9",
              }}
              onError={(e) => {
                console.error("YouTube iframe load error:", e);
              }}
              onLoad={() => {
                console.log("YouTube iframe loaded");
              }}
            />
          );
        }
      }
      
      // 通常の動画ファイルの場合はvideoタグを使用
      return (
        <video
          src={src}
          width={sizes?.width || 640}
          height={sizes?.height || 360}
          controls={settings?.controls !== false}
          loop={settings?.loop || false}
          muted={settings?.muted || false}
          autoPlay={settings?.autoPlay || false}
          style={{
            width: "100%",
            maxWidth: sizes?.width || 640,
            height: "auto",
          }}
          onError={(e) => {
            console.error("Video load error:", e);
          }}
          onLoadStart={() => {
            console.log("Video load started");
          }}
          onLoadedData={() => {
            console.log("Video data loaded");
          }}
        />
      );
    },
  });

  return customPlugin;
}
