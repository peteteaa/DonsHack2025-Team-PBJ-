// /components/VideoHeader.tsx
"use client";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Home as HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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
					className="btn btn-outline btn-icon"
					onClick={() => router.push("/youtube")}
					type="button"
				>
					<HomeIcon />
				</button>
			</div>
		</div>
	);
};

export default VideoHeader;
