// /components/VideoPage.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useVideoContext } from "@/context/VideoContext";
import VideoHeader from "@/components/VideoHeader";
import VideoPlayer from "@/components/VideoPlayer";
import TranscriptQuiz from "@/components/TranscriptQuizContainer";
import NotesPanel from "@/components/NotesPanel";
import type { UserNoteItem } from "@shared/types";

const VideoPage = () => {
	const { id } = useParams();
	const { videoPageData, setVideoPageData, setNotes } = useVideoContext();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchVideoPage = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/video/${id}`);
				if (!response.ok) throw new Error("Failed to fetch video page data");
				const data = await response.json();
				setVideoPageData(data);
				setNotes(
					data.notes.sort(
						(a: UserNoteItem, b: UserNoteItem) => a.moment - b.moment
					)
				);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchVideoPage();
		}
	}, [id, setVideoPageData, setNotes]);

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
