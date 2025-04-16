// /components/VideoPage.tsx
"use client";
import NotesPanel from "@/components/notes/NotesPanel";
import TranscriptQuiz from "@/components/transcript/TranscriptQuizContainer";
import VideoHeader from "@/components/videoPage/VideoHeader";
import VideoPlayer from "@/components/videoPage/VideoPlayer";
import { useVideoContext } from "@/hooks/useVideoContext";

const VideoPage = () => {
	const { videoPageData, isLoading, error } = useVideoContext();

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div className="text-red-500">Error: {error}</div>;
	if (!videoPageData) return null;

	return (
		<div className="container mx-auto py-4 px-4 h-[100vh] overflow-auto box-border">
			<div className="grid grid-cols-[2fr_1fr] grid-rows-[3rem_1fr_2fr] gap-6 h-[100%] mx-auto">
				<div className="col-span-2">
					<VideoHeader title={videoPageData.video.title} />
				</div>
				<div className="h-full w-full">
					<VideoPlayer />
				</div>
				<div className="row-span-2">
					<NotesPanel />
				</div>
				<div>
					<TranscriptQuiz contentTable={videoPageData.video.contentTable} />
				</div>
			</div>
		</div>
	);
};

export default VideoPage;
