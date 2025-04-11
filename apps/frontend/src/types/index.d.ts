export interface YouTubePlayer {
	getCurrentTime: () => number;
	seekTo: (timestamp: number) => void;
}

declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
		YT: {
			Player: new (
				elementId: string,
				config: {
					height: string;
					width: string;
					videoId: string;
					playerVars?: {
						autoplay?: number;
						modestbranding?: number;
						rel?: number;
					};
					events?: {
						onStateChange?: (event: { data: number }) => void;
					};
				},
			) => YouTubePlayer;
			PlayerState: { ENDED: number; PLAYING: number };
		};
	}
}
