"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Chapter {
	chapter: string;
	summary: string;
	transcript: Array<{
		start: number;
		end: number;
		text: string;
	}>;
}

interface ContentCardProps {
	contentTable: Chapter[];
	currentTimestamp: number | null;
}

const ContentCard = ({ contentTable, currentTimestamp }: ContentCardProps) => {
	const [isNotesView, setIsNotesView] = useState(false);
	const [notes, setNotes] = useState("");
	const [savedNotes, setSavedNotes] = useState<
		{ text: string; videoTime: number | null }[]
	>([]);

	const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNotes(event.target.value);
	};

	const formatVideoTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const handleSaveNotes = () => {
		if (notes.trim()) {
			setSavedNotes([
				...savedNotes,
				{
					text: notes,
					videoTime: currentTimestamp,
				},
			]);
			setNotes("");
		}
	};

	const toggleView = () => {
		setIsNotesView(!isNotesView);
	};

	return (
		<Card className="transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group">
			<CardHeader className="pb-2 flex flex-row items-center justify-between">
				<CardTitle className="group-hover:text-primary group-hover:brightness-125">
					Content Overview
				</CardTitle>
				<Button
					aria-label={isNotesView ? "View Content" : "Take Notes"}
					onClick={toggleView}
					variant="ghost"
				>
					{isNotesView ? "View Content" : "Take Notes"}
				</Button>
			</CardHeader>
			<CardContent>
				<div className="flex gap-6">
					<div className={`${isNotesView ? "hidden" : "w-2/3"} space-y-4`}>
						{contentTable.map((chapter) => (
							<div
								className="border-b pb-4 last:border-0"
								key={chapter.chapter}
							>
								<h3 className="text-base font-semibold mb-1">
									{chapter.chapter}
								</h3>
								<p className="text-sm text-muted-foreground">
									{chapter.summary}
								</p>
							</div>
						))}
					</div>

					<div className={`${isNotesView ? "w-full" : "w-1/3"}`}>
						{isNotesView && (
							<div className="mb-6">
								<h3 className="text-base font-semibold mb-1">Your Notes</h3>
								<textarea
									className="w-full h-40 p-2 border rounded bg-background mb-2"
									onChange={handleNotesChange}
									placeholder="Write your notes here..."
									value={notes}
								/>
								<Button
									className="w-full mb-4"
									onClick={handleSaveNotes}
									variant="outline"
								>
									Save Notes
								</Button>
							</div>
						)}
						<div className="space-y-2">
							{savedNotes.map((note) => (
								<div className="p-2 border rounded" key={note.videoTime}>
									<p className="text-sm">{note.text}</p>
									{note.videoTime !== null && (
										<p className="text-xs text-muted-foreground mt-1">
											{formatVideoTime(note.videoTime)}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ContentCard;
