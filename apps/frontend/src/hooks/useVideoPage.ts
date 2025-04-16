import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { VideoPage as VideoPageType } from "@shared/types";
import type { YouTubePlayer } from "@/types";

export function useVideoPage() {
  const [videoPageData, setVideoPageData] = useState<VideoPageType | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    const fetchVideoPage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/video/${id}`);
        if (!response.ok) throw new Error("Failed to fetch video page data");
        const data: VideoPageType = await response.json();
        setVideoPageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoPage();
  }, [id]);

  // Inject YouTube API and initialize player when video data is ready
  useEffect(() => {
    if (!videoPageData) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const videoId = videoPageData.video.url.split("v=")[1];
      try {
        const newPlayer = new window.YT.Player("youtube-player", {
          height: "100%",
          width: "100%",
          videoId,
          playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
          events: { onStateChange: (e: { data: number }) => console.log("Player state:", e.data) },
        });
        setPlayer(newPlayer);
      } catch (e) {
        console.error("Error creating YouTube player:", e);
      }
    };
  }, [videoPageData]);

  return {
    videoPageData,
    setVideoPageData,
    player,
    setPlayer,
    isFullscreen,
    setIsFullscreen,
    isLoading,
    error,
  };
}
