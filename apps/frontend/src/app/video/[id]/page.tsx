// /app/page.tsx or whichever entry file
"use client";
import VideoPage from "@/components/videoPage/VideoPage";
import { VideoProvider } from "@/context/VideoContext";

export default function Page() {
	return (
		<VideoProvider>
			<VideoPage />
		</VideoProvider>
	);
}
