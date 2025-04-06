"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import type { UserNoteItem } from "@shared/types";

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
	savedNotes: Array<UserNoteItem & { _id: string }>;
	note: string;
	onSetNote: (note: string) => void;
	onSaveNotes: (notes: string) => void;
}

const ContentCard = ({
	contentTable,
	savedNotes,
	onSaveNotes,
	onSetNote,
	note,
}: ContentCardProps) => {
	const [isNotesView, setIsNotesView] = useState(false);

	const formatVideoTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
									onChange={(e) => onSetNote(e.target.value)}
									placeholder="Write your notes here..."
									value={note}
								/>
								<Button
									className="w-full mb-4"
									onClick={() => onSaveNotes(note)}
									variant="outline"
								>
									Save Notes
								</Button>
							</div>
						)}
						<div className="space-y-2">
							{savedNotes.map((note) => (
								<div className="p-2 border rounded" key={note._id}>
									<p className="text-sm">{note.text}</p>
									{note.moment !== null && (
										<p className="text-xs text-muted-foreground mt-1">
											{formatVideoTime(note.moment)}
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
