// /components/VideoPlayer.tsx
"use client";
import { useEffect } from "react";
import { useVideoContext } from "@/context/VideoContext";

const VideoPlayer = () => {
	const { videoPageData, setPlayer } = useVideoContext();

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
					videoId: videoId,
					playerVars: {
						autoplay: 0,
						modestbranding: 1,
						rel: 0,
					},
					events: {
						onStateChange: (event: { data: number }) => {
							console.log("Player state changed:", event.data);
						},
					},
				});
				setPlayer(newPlayer);
			} catch (error) {
				console.error("Error creating YouTube player:", error);
			}
		};
	}, [videoPageData, setPlayer]);

	return (
		<div className="card transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group max-h-[80vh] overflow-y-auto">
			<div className="card-content p-0">
				<div className="relative pt-[56.25%]">
					<div className="absolute inset-0 w-full h-full" id="youtube-player" />
				</div>
			</div>
		</div>
	);
};

export default VideoPlayer;
