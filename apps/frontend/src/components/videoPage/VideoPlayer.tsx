// /components/VideoPlayer.tsx
"use client";

const VideoPlayer = () => {
	// Player initialization is handled in useVideoPage via context
	return (
		<div className="card transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 h-full w-full">
			<div className="card-content p-0 h-full w-full">
				<div className="relative pt-[56.25%] h-full w-full">
					<div
						id="youtube-player"
						className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
					/>
				</div>
			</div>
		</div>
	);
};

export default VideoPlayer;
