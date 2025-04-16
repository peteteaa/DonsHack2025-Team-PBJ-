// /context/VideoContext.tsx
"use client";

import { useVideoPage } from "@/hooks/useVideoPage";
import type { YouTubePlayer } from "@/types";
import type { VideoPage as VideoPageType } from "@shared/types";
import { createContext, useMemo } from "react";

// --- VideoContext: Provides video, quiz, and player state across the app ---

// Context value type
export interface VideoContextProps {
	videoPageData: VideoPageType | null;
	setVideoPageData: React.Dispatch<React.SetStateAction<VideoPageType | null>>;
	player: YouTubePlayer | null;
	setPlayer: React.Dispatch<React.SetStateAction<YouTubePlayer | null>>;
	isFullscreen: boolean;
	setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
	// Loading and error states managed by useVideoPage
	isLoading: boolean;
	error: string | null;
}

export const VideoContext = createContext<VideoContextProps | undefined>(
	undefined,
);

// Custom hook has been moved to useVideoContext.ts

// Provider component
export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Only provide truly global state (video page, player, fullscreen)
	const videoPage = useVideoPage();

	const value = useMemo(() => ({ ...videoPage }), [videoPage]);

	return (
		<VideoContext.Provider value={value}>{children}</VideoContext.Provider>
	);
};
