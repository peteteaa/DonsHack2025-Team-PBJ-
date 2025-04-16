// /components/VideoHeader.tsx
"use client";
import { useRouter } from "next/navigation";
import { Home as HomeIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface VideoHeaderProps {
	title: string;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ title }) => {
	const router = useRouter();
	return (
		<div className="flex justify-between items-center h-full w-full">
			<h1 className="text-3xl font-bold">{title}</h1>
			<div className="flex gap-4">
				<ThemeToggle />
				<button
					type="button"
					onClick={() => router.push("/youtube")}
					className="btn btn-outline btn-icon"
				>
					<HomeIcon />
				</button>
			</div>
		</div>
	);
};

export default VideoHeader;
