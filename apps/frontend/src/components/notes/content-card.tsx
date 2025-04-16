"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotes } from "@/hooks/useNotes";
import { useVideoContext } from "@/hooks/useVideoContext";
import { formatTimestamp } from "@/lib/utils";
import { useState } from "react";

const ContentCard = () => {
	const { videoPageData } = useVideoContext();
	const { notes, note, setNote, handleSaveNotes } = useNotes();
	const [isNotesView, setIsNotesView] = useState(false);

	const toggleView = () => {
		setIsNotesView((prev) => !prev);
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
					<div
						className={`${
							isNotesView ? "hidden" : "w-2/3"
						} h-full overflow-auto`}
					>
						{videoPageData?.video.contentTable.map((chapter) => (
							<div className="border-b pb-4 last:border-0" key={chapter.id}>
								<h3 className="text-base font-semibold mb-1">
									{chapter.chapter}
								</h3>
								<h6 className="text-sm font-semibold mb-1">
									{formatTimestamp(chapter.start)} -{" "}
									{formatTimestamp(chapter.end)}
								</h6>
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
									onChange={(e) => setNote(e.target.value)}
									placeholder="Write your notes here..."
									value={note}
								/>
								<Button
									className="w-full mb-4"
									onClick={() => handleSaveNotes(note)}
									variant="outline"
								>
									Save Notes
								</Button>
							</div>
						)}
						<div className="space-y-2">
							{notes.map((note) => (
								<div className="p-2 border rounded" key={note._id}>
									<p className="text-sm">{note.text}</p>
									{note.moment !== null && (
										<p className="text-xs text-muted-foreground mt-1">
											{formatTimestamp(note.moment)}
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
