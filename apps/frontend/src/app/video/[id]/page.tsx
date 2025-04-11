// /app/page.tsx or whichever entry file
"use client";
import { VideoProvider } from "@/context/VideoContext";
import VideoPage from "@/components/VideoPage";

export default function Page() {
	return (
		<VideoProvider>
			<VideoPage />
		</VideoProvider>
	);
}
