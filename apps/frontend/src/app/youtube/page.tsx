"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function YouTubePage() {
	const router = useRouter();
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(true);

	// Handle theme switching based on the isDarkMode state
	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [isDarkMode]);

	// Check localStorage for user preference on initial load
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "dark") {
			setIsDarkMode(true);
		}
	}, []);

	// Fetch previously watched videos
	useEffect(() => {
		fetch("api/video")
			.then((response) => response.json())
			.then((data) => {
				const mappedVideos = data.map(
					(entry: { videoId: { _id: string; title: string } }) => entry.videoId,
				);
				setVideos(mappedVideos);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching videos:", error);
				setLoading(false);
			});
	}, []);

	const extractVideoId = (url: string) => {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const id = extractVideoId(url);
		if (id) {
			router.push(`/video/${id}`);
		} else {
			setError("Invalid YouTube URL. Please enter a valid YouTube URL.");
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 dark:bg-gray-900">
			<Card className="max-w-3xl mx-auto dark:bg-gray-800 dark:text-white">
				<CardHeader className="flex justify-between items-center">
					<div>
						<CardTitle>YouTube Video Player</CardTitle>
						<CardDescription>
							Enter a YouTube URL to watch and analyze the video
						</CardDescription>
					</div>
					<Button
						aria-label={
							isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
						}
						className="p-2"
						onClick={() => setIsDarkMode(!isDarkMode)}
						variant="ghost"
					>
						{isDarkMode ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="flex flex-col sm:flex-row gap-2">
							<Input
								className="flex-1"
								onChange={(e) => setUrl(e.target.value)}
								placeholder="https://www.youtube.com/watch?v=..."
								type="text"
								value={url}
							/>
							<Button type="submit">Load Video</Button>
						</div>
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
					</form>
				</CardContent>
			</Card>

			<Card className="max-w-3xl mx-auto mt-6 dark:bg-gray-800 dark:text-white">
				<CardHeader>
					<CardTitle>Previously Visited Videos</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p>Loading...</p>
					) : videos.length > 0 ? (
						<ul>
							{videos.map((video: { title: string; _id: string }) => (
								<li className="mb-4" key={video._id}>
									<a
										className="text-blue-500 hover:underline"
										href={`/video/${video._id}`}
									>
										{video.title}
									</a>
								</li>
							))}
						</ul>
					) : (
						<p>No previously watched videos found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
